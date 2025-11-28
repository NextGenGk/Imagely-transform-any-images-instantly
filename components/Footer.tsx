export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] border-t border-violet-600 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-white/90 font-medium">
                    <a href="https://merchant.razorpay.com/policy/RgSYeeXXMkAo0p/shipping" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Shipping
                    </a>
                    <a href="https://merchant.razorpay.com/policy/RgSYeeXXMkAo0p/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Terms & Conditions
                    </a>
                    <a href="https://merchant.razorpay.com/policy/RgSYeeXXMkAo0p/refund" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        Cancellation & Refunds
                    </a>
                </div>
                <p className="text-center text-sm text-white font-medium">
                    Copyright © 2025 Imagely. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
