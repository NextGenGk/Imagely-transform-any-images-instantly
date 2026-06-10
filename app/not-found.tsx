import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center">
      <div className="w-full py-12 md:py-24 bg-white px-4 md:px-6">
        <div className="max-w-[85rem] mx-auto">
          <div className="relative bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-16 md:px-20 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Subtle gradient background to match theme */}
            <div
              className="absolute inset-0 -z-10 pointer-events-none opacity-50"
              style={{
                backgroundImage: `
                  radial-gradient(at 30% 50%, #f3e8ff 0%, transparent 60%),
                  radial-gradient(at 70% 50%, #ede9fe 0%, transparent 60%)
                `,
                backgroundBlendMode: "normal",
              }}
            />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-transparent bg-clip-text mb-4">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Page not found
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
              </p>
              
              <Link 
                href="/"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-[#9938CA] text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                Return to Home
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
