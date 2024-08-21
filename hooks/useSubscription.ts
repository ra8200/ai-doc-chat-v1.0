"use client";

import { db } from "@/firebase/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

// Number of Documents the usser is allowed
const FREE_LIMIT = 2;
const PRO_LIMIT = 20; 

function useSubscription() {
    const [hasActiveMembership, setHasActiveMembership] = useState(null);
    const [isOverFileLimit, setIsOverFileLimit] = useState(false);
    const { user } = useUser();
    
    // Listen to user's document from firestore
    const [snapshot, loading, error] = useDocument(
        user && doc(db, "users", user.id),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );
    
    // Listen to the user's file collection from firestore
    const [filesSnapshot, filesLoading, filesError] = useCollection(
        user && collection(db, "users", user?.id, "files"),
    );

    useEffect(() => {
        if (!snapshot) return;

        const data = snapshot.data();
        
        if (!data) return;

        setHasActiveMembership(data.activeMembership);
    }, [snapshot]);

    useEffect(() => {
        if (!filesSnapshot || hasActiveMembership === null) return;
        
        const files = filesSnapshot.docs;
        const usersLimit = hasActiveMembership ? PRO_LIMIT : FREE_LIMIT;

        console.log("Check if user is over the limit", files.length, usersLimit);

        setIsOverFileLimit(files.length >= usersLimit);
    }, [filesSnapshot, hasActiveMembership, PRO_LIMIT, FREE_LIMIT]);

    return { hasActiveMembership, isOverFileLimit, loading, error, filesLoading };
}

export default useSubscription
