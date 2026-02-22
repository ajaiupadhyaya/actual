/**
 * The Leveraged Machine - Main Scrollytelling Entry Point
 * 
 * Routes to individual acts. For now, shows Act 2 (Anatomy of a Buyout)
 * as the reference implementation.
 */

import { Metadata } from 'next';
import Act2LBOAnatomy from '@/components/journalism/acts/Act2';

export const metadata: Metadata = {
  title: 'The Leveraged Machine - Private Equity & Corporate Debt Anatomy',
  description:
    'An interactive data journalism piece dissecting how private equity actually works: how firms acquire companies, load them with debt, extract fees, and exit.',
  keywords: [
    'private equity',
    'pe',
    'lbo',
    'buyout',
    'debt',
    'leverage',
    'corporate debt',
    'finance',
    'data journalism',
  ],
  openGraph: {
    title: 'The Leveraged Machine',
    description: 'How private equity actually works',
    type: 'website',
  },
};

export default function JournalismPage() {
  return (
    <main className="bg-slate-950 text-amber-50 font-serif">
      {/* Navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-xl font-bold text-amber-50">
              The Leveraged Machine
            </h1>
            <p className="text-xs text-slate-500">Private Equity & Corporate Debt Anatomy</p>
          </div>
          <a
            href="/"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            ← Dashboard
          </a>
        </div>
      </nav>

      {/* Main content */}
      <div className="pt-16">
        <Act2LBOAnatomy />
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-sm text-slate-400">
            <strong>The Leveraged Machine</strong> is a data journalism piece exploring the
            mechanics and systemic implications of private equity.
          </p>
          <p className="text-xs text-slate-500">
            All data sources are cited within each visualization. See methodology notes for
            details on computational approaches.
          </p>
          <p className="text-xs text-slate-600 mt-6">
            Built with Next.js, D3.js, Scrollama, and data discipline.
          </p>
        </div>
      </footer>
    </main>
  );
}
