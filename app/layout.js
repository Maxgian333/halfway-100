import './globals.css';

export const metadata = {
  title: 'Halfway to God — The 100 Days',
  description: 'A 100-day discipline challenge. Miss one day, every habit, and the count returns to zero.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}
