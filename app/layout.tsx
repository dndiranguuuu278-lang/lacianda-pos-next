import './globals.css';

export const metadata = {
  title: 'Lacianda Wines & Spirits POS',
  description: 'Point of Sale & eTIMS Integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
