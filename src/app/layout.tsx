import type { Metadata } from "next";
import { Comfortaa, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

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
  title: "Hostella",
  description: "Your description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div
          style={{
            fontFamily: `${poppins.style.fontFamily}, ${comfortaa.style.fontFamily}`,
          }}
        >
          {children}
        </div>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
