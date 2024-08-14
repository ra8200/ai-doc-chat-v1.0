import PlaceholderDocuments from "./PlaceholderDocuments"

function Documents() {
  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      {/* Map through the documents */}
      <PlaceholderDocuments />

    </div>
  )
}

export default Documents