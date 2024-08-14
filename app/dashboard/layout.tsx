import Header from "@/components/Header"
import { ClerkLoaded } from "@clerk/nextjs"

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkLoaded>
        <div className="flex-1 flex-col flex h-screen">
            <Header />

            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    </ClerkLoaded>
  )
}

export default DashboardLayout