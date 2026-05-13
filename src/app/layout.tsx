import "./globals.css";
import Navbar from "@/components/navbar";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <Navbar/>
      </header>
      <main className="flex-1">
        {children}
      </main>
      </body>
    </html>
  );
}
