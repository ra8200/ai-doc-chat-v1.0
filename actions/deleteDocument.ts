"use server";
import { adminDb, adminStorage } from "@/firebase/firebaseAdmin";
import { indexName } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { doc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function deleteDocument(docId: string) {
    auth().protect();

    const { userId } = await auth();

    // Delete document from Firestore Database
    await adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(docId)
        .delete();

    // Delete document from Firebase Storage
    await adminStorage
        .bucket(process.env.FIREBASE_STORAGE_BUCKET)
        .file(`users/${userId}/files/${docId}`)
        .delete();

    // Delete embeddings, associated with the document, from Pinecone
    const index = await pineconeClient.index(indexName);
    await index.namespace(docId).deleteAll();

    // Revalidate the dashboard page to ensure the document are up to date
    revalidatePath("/dashboard");
}

