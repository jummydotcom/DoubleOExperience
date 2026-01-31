export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Contact Us</h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Get in touch with us
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="border border-amber-900/20 rounded-lg p-8 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-2">Email</h2>
              <p className="text-amber-800">contact@example.com</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-2">Phone</h2>
              <p className="text-amber-800">Contact information coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
