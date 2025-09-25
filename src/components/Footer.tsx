'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-center">
          <p className="text-sm text-gray-500">
            © <Link href="/about" className="hover:text-gray-700 transition-colors">凌一</Link> 2024 - {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}