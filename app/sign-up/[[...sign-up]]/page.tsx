import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center">
      <div className="w-full py-12 md:py-24 bg-white px-4 md:px-6">
        <div className="max-w-[85rem] mx-auto">
          <div className="relative bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-16 md:px-16 md:py-24 overflow-hidden flex flex-col items-center justify-center">
            {/* Optional subtle gradient background to match theme */}
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
            
            <div className="w-full max-w-md relative z-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Get Started
                </h1>
                <p className="text-gray-600">
                  Join Imagely to start transforming images
                </p>
              </div>
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-lg border-0",
                  },
                }}
                forceRedirectUrl="/upload"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
