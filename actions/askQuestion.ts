"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { generateLangchainCompletion } from "@/lib/ai/langchain"
import { Message } from "@/components/Chat";

const FREE_LIMIT = 2;
const PRO_LIMIT = 20;

export async function askQuestion( id: string, question: string) {
    auth().protect();
    const { userId } = await auth();

    const chatRef = adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(id)
        .collection("chats");

    // check how many user messages are in the chat
    const chatSnapshot = await chatRef.get();
    const userMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "human"
    );

    // limit pro and free plans
    // check how many user messages are in the chat
    // Check membership limits for messages in a document
    // check if user is on PRO plan and has asked more than 100 questions

    const userMessage: Message = {
        role: "human",
        message: question,
        createdAt: new Date(),
    }

    await chatRef.add(userMessage);

    //Generate AI response
    const reply = await generateLangchainCompletion(id,question);

    const aiMessage: Message = {
        role: "ai",
        message: reply,
        createdAt: new Date(),
    }

    await chatRef.add(aiMessage);

    return { success: true, message: null };
}