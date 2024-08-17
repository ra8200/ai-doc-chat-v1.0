"use client"

import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { db, storage } from "@/firebase/firebase";
import { useUser } from "@clerk/nextjs";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { v4 as uuid4 } from "uuid"

export enum StatusText {
    UPLOADING = "Uploading file...",
    UPLOADED = "The has been uploaded successfully.",
    SAVING = "Saving the file to the database...",
    GENERATING = "Generating AI Embedding, This will take a few seconds...",
}

    export type Status = StatusText[keyof StatusText]

function useUpload() {
    const [progress, setProgress] = useState<number | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const { user } = useUser();
    const router = useRouter();

    const handleUpload = async (file: File) => {
        if (!file || !user) return;

        // TODO: FREE/PRO limitiations...

        const fileIdToUploadTo = uuid4();

        const storageRef = ref(
            storage, 
            `users/${user.id}/files/${fileIdToUploadTo}`
        );

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed", (snapshot) => {
            const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setStatus(StatusText.UPLOADING);
            setProgress(percent);
        }, (error) => {
            console.error("Error uploading file", error);
        }, async () => {
            setStatus(StatusText.UPLOADED);
            
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            setStatus(StatusText.SAVING);
            await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
                name: file.name,
                size: file.size,
                type: file.type,
                downloadUrl: downloadUrl,
                ref: uploadTask.snapshot.ref.fullPath,
                createdAt: new Date(),
            });

            setStatus(StatusText.GENERATING);
            // Generate AI Embedding
            await generateEmbeddings(fileIdToUploadTo);

            setFileId(fileIdToUploadTo);
        });
    };

    return { progress, fileId, status, handleUpload };
};

export default useUpload;
