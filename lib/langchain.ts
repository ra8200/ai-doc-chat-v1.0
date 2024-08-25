import { ChatOpenAI } from "@langchain/openai"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PineconeStore } from "@langchain/pinecone";
import pineconeClient from "./pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "@/firebase/firebaseAdmin";
import { auth } from "@clerk/nextjs/server"

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
});

export const indexName = "aidocchat";

async function fetchMessagesFromDB(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    console.log("--- Fetching chat history from the firestore database... ---");

    const chats = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .collection("chat")
        .orderBy("createdAt", "desc")
        .get();

    const chatHistory = chats.docs.map((doc) =>
        doc.data().role === "human"
        ? new HumanMessage(doc.data().message)
        : new AIMessage(doc.data().message)
    );

    console.log(`--- fetch last ${chatHistory.length} messages successfully ---`);
    console.log(chatHistory.map((msg) => msg.content.toString()));

    return chatHistory;
}

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }
    
    console.log("--- Fetching the download URL from Firebase... ---");
    const firebaseRef = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .get();

    const downloadUrl = firebaseRef.data()?.downloadUrl;

    if (!downloadUrl) {
        throw new Error("Download URL not found");
    }

    console.log(`--- Download URL fetched successfully: ${downloadUrl} ---`);

    // Fetch the document from the specified URL
    const response = await fetch(downloadUrl);

    // Load the document into the Document Object
    const data = await response.blob();

    // Load the document from the specified path
    const loader = new PDFLoader(data);
    const doc = await loader.load();

    //Split the document into smaller parts for processing
    console.log("--- Splitting the document into smaller parts... ---");
    const splitter = new RecursiveCharacterTextSplitter();

    const splitDocs = await splitter.splitDocuments(doc);
    console.log(`--- Split into ${splitDocs.length} parts ---`);

    return splitDocs;
}

async function namespaceExists(
    index: Index<RecordMetadata>, 
    namespace: string
) {
    if (namespace === null) throw new Error("Namespace not provided.");
    const { namespaces } = await index.describeIndexStats();  
    return namespaces?.[namespace] !== undefined;  
} 

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth(); 

    if (!userId) {
        throw new Error("User not found");
    }

    let pineconeVectorStore;

    // Generating embeddings (numerical representation) of the split documents
    console.log("Generating embeddings for document: ", docId);
    const embeddings = new OpenAIEmbeddings();

    const index = await pineconeClient.index(indexName);
    const namespaceAlreadyExists = await namespaceExists(index, docId);

    if (namespaceAlreadyExists) {
        console.log (`--- Namespace ${docId} already exists, reusing existing embeddings... ---`);

        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId,
        });

        return pineconeVectorStore;
    } else {
        // If the namespace does not exist, download the file from firestore via the stored Download URL & generate the embeddings and store them in the Pinecone Vectore store
        const splitDocs = await generateDocs(docId);

        console.log(`--- Starting the embeddings in namesspace ${docId} in the ${indexName} Pinecone vector store... ---`);

        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs,
            embeddings,
            {
                pineconeIndex: index,
                namespace: docId,
            }
        );

        return pineconeVectorStore;
    }
}

const generateLangchainCompletion = async (docId: string, question: string) => {
    let pineconeVectorStore;

    pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
    if (!pineconeVectorStore) {
        throw new Error("Pinecone vector store not found");
    }

    //Create a retriever to search throught the vector store
    console.log("--- Creating a retriever... ---")
    const retriever = pineconeVectorStore.asRetriever();

    // Fetch the chat history from the database
    const chatHistory = await fetchMessagesFromDB(docId);

    // Define a prompt template for generating search queries based on the conversation history
    console.log("--- Defining a prompt template... ---");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory, //Insert the actual chat history

        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get the information relevat to the conversation.",
        ],
     ]);

     // Create a history-aware retriever chain that uses the model, retriever, and prompt template
    console.log("--- Creating a history-aware retriever chain... ---");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    })

    // Define a prompt template foe answering questions based on retrieved context
    console.log("--- Defining a prompt template for answering questions... ---");
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's question based on the below context:\n\n{context}",
        ],

        ...chatHistory,

        ["user", "{input}"],
    ]);

    // Create a chain to combine the retrieved document into a coherent response
    console.log("--- Creating a document and combining chain... ---");
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm: model,
        prompt: historyAwareRetrievalPrompt,
    });

    // Create the main retrieval chain that combines the history-aware retriever and document-combining chains
    console.log("--- Creating the main retrieval chain... ---");
    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCombineDocsChain,
    });

    console.log("--- Running the chain with a sample conversation... ---");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history: chatHistory,
        input: question,
    });

    console.log(reply.answer);
    return reply.answer;
};

export { model, generateLangchainCompletion };