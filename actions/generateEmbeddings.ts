"use server"

import { generateEmbeddingsInPineconeVectorStore } from "@/lib/ai/langchain";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
    auth().protect(); // protect this route with Clerk

    // turn a doc into embeddings [0.234234, ...]
    await generateEmbeddingsInPineconeVectorStore(docId);

    revalidatePath("/dashboard");
    
    return { completed: true };

}