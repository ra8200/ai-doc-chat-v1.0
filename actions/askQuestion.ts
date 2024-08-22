"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { generateLangchainCompletion } from "@/lib/langchain"
import { Message } from "@/lib/humanMessage";
import { FREE_LIMIT, PRO_LIMIT } from "@/lib/limits";

export async function askQuestion( id: string, question: string) {
    console.log(`askQuestion triggered with id: ${id}, question: ${question}`);
    auth().protect();
    const { userId } = await auth();

    const chatRef = adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(id)
        .collection("chat");

    // check how many user messages are in the chat
    const chatSnapshot = await chatRef.get();
    const userMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "human"
    );

    // Check membership limits for messages in a document
    const userRef = await adminDb.collection("users").doc(userId!).get();

    console.log("DEBUG 2", userRef.data());

    // limit free plans to FREE number of questions
    if (!userRef.data()?.hasActiveMembership) {
        if (userMessages.length >= FREE_LIMIT) {
            return {
                success: false,
                message: `You will need to upgrade to PRO to ask more than ${FREE_LIMIT} questions. 😔`,
            };
        }
    }

    // limit pro plans to PRO number of questions
    if (userRef.data()?.hasActiveMembership) {
        if (userMessages.length >= PRO_LIMIT) {
            return {
                success: false,
                message: `You have reached the limit of ${PRO_LIMIT} questions per document! 😔`,
            };
        }
    }

    // check how many user messages are in the chat
    
    
    

    const userMessage: Message = {
        role: "human",
        message: question,
        createdAt: new Date(),
    }

    await chatRef.add(userMessage);

    //Generate AI response
    const reply = await generateLangchainCompletion(id, question);
    console.log(`Generated AI reply: ${reply}`);

    const aiMessage: Message = {
        role: "ai",
        message: reply,
        createdAt: new Date(),
    }

    await chatRef.add(aiMessage);

    return { success: true, message: null };
}