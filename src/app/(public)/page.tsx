export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="border-b border-slate-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Prodance Academy</div>
          <div className="space-x-4">
            <a href="/schedule" className="text-slate-300 hover:text-white transition">
              Schedule
            </a>
            <a href="/events" className="text-slate-300 hover:text-white transition">
              Events
            </a>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Welcome to Prodance Academy</h1>
          <p className="text-xl text-slate-300">
            Learn dance, connect with our community, and grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Our Classes</h2>
            <p className="text-slate-300 mb-4">
              From basic fundamentals to advanced techniques, we offer classes for all levels.
            </p>
            <a href="/schedule" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition">
              View Schedule
            </a>
          </div>

          <div className="bg-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-slate-300 mb-4">
              Join us for special workshops, performances, and community events.
            </p>
            <a href="/events" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition">
              See Events
            </a>
          </div>
        </div>

        <footer className="text-center text-slate-400 border-t border-slate-700 pt-8 mt-16">
          <p>&copy; 2024 Prodance Academy. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
