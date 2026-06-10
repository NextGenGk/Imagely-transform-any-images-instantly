import React from 'react';
import Link from 'next/link';

const footerLinks = {
  Pages: [
    { label: "Upload", href: "/upload" },
    { label: "Pricing", href: "/pricing" },
    { label: "Use Cases", href: "/#use-cases" },
    { label: "Testimonials", href: "#testimonials" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/legal/cookies" },
  ],
};

export default function FooterSection() {
  return (
    <section className="w-full py-6 md:py-12 bg-white px-4 md:px-6">
      <div className="max-w-[85rem] mx-auto">
        <div className="bg-[#fbf7ff] rounded-[2.5rem] md:rounded-[3rem] px-8 py-16 md:px-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <Link href="/">
                <img src="/clerk-signin.png" alt="Imagely" className="h-8 w-auto" />
              </Link>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
                Transform your images with AI-powered tools. Just describe what you want and watch the magic happen.
              </p>
            </div>
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Imagely. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://x.com/gauravkumar1697" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Twitter</a>
              <a href="https://github.com/NextGenGk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/gauravkumar077/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
