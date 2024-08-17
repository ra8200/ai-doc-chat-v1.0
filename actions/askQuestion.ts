"use server"
import { auth } from "@clerk/nextjs/server";

export async function askQuestion( id: string, question: string) {
    auth().protect();
    const { userId } = await auth();
}