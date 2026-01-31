export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Events</h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Join us for our celebration
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="border border-amber-900/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-2">Wedding Ceremony</h2>
            <p className="text-amber-800 mb-2">Date and time to be announced</p>
            <p className="text-amber-800">Location to be announced</p>
          </div>
          <div className="border border-amber-900/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-2">Reception</h2>
            <p className="text-amber-800 mb-2">Date and time to be announced</p>
            <p className="text-amber-800">Location to be announced</p>
          </div>
        </div>
      </div>
    </div>
  );
}
