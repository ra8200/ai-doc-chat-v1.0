"use client";

import { PlusCircleIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

function PlaceholderDocuments() {
  const router = useRouter()

  const handleClick = () => {
    //Check if user is Free Tier and if they are over the 3 file limit, then push to the upgrade page
    router.push("/dashboard/upload")
  }

  return (
    <Button 
      onClick={handleClick} 
      className="flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400 hover:bg-gray-300"
    >
      <PlusCircleIcon className="h-16 w-16" />
      <p>Add a PDF</p>
    </Button>
  )
}

export default PlaceholderDocuments;
