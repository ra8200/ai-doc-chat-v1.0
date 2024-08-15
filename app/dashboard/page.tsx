import Documents from "@/components/Documents"

export const dynamic = "force-dynamic"

function Dashboard() {
  return (
    <div className="h-full max-w-7xl mx-auto">
      <h1 className="text-3xl bg-gray-100 text-indigo-600 font-semibold">
        My Documents
      </h1>

      <Documents />
    </div>
  )
}

export default Dashboard