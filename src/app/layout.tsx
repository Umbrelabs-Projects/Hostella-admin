import type { Metadata } from "next";
import { Comfortaa, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hostella Admin",
  description: "Hostel management and administration platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthSessionProvider>
          <div
            style={{
              fontFamily: `${poppins.style.fontFamily}, ${comfortaa.style.fontFamily}`,
            }}
          >
            {children}
          </div>
        </AuthSessionProvider>

        <Toaster 
          position="top-right" 
          richColors 
          duration={4000}
        />
      </body>
    </html>
  );
}
