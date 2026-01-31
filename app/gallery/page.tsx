export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Gallery</h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Our favorite moments together
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-square bg-amber-50 border border-amber-900/20 rounded-lg flex items-center justify-center">
              <p className="text-amber-700 text-sm">Photo coming soon</p>
            </div>
            <div className="aspect-square bg-amber-50 border border-amber-900/20 rounded-lg flex items-center justify-center">
              <p className="text-amber-700 text-sm">Photo coming soon</p>
            </div>
            <div className="aspect-square bg-amber-50 border border-amber-900/20 rounded-lg flex items-center justify-center">
              <p className="text-amber-700 text-sm">Photo coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
