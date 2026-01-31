export default function Footer() {
  return (
    <footer className="bg-white border-t border-amber-900/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-amber-900 text-sm">
          <p>&copy; {new Date().getFullYear()} Wedding Celebration. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
