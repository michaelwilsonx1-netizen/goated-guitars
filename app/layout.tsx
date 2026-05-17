import type { Metadata } from 'next';
import './globals.css';

// Enforcing the metadata structure
export const metadata: Metadata = {
  title: 'GOATED GUITARS | Legendary Instruments',
  description: 'Curated selection of legendary guitars for the greatest players.',
  keywords: ['guitar', 'luthier', 'vintage', 'electric guitar', 'acoustic', 'analog boutique'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* Use semantic HTML and robust Tailwind classes */}
      <body className="bg-zinc-950 text-zinc-200 antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
