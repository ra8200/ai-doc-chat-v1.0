import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

import { cn } from "@/lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AI Doc Chat",
  description: "AI Doc Chat is a platform that allows you to chat with your PDFs, making them interactive and engaging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en"suppressHydrationWarning>
        <body className={cn(
          "min-h-screen h-screen overflow-hidden flex flex-col",
          fontSans.variable
        )}>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
