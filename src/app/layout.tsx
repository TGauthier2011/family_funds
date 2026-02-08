import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BillsProvider } from "@/components/bills/BillsProvider";
import { HouseholdsProvider } from "@/components/households/HouseholdsProvider";

export const metadata: Metadata = {
  title: 'Family Finance Flow',
  description: "Manage your family's finances with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <HouseholdsProvider>
          <BillsProvider>
            {children}
          </BillsProvider>
        </HouseholdsProvider>
        <Toaster />
      </body>
    </html>
  );
}
