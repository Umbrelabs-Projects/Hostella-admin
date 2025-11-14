"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";

export default function NotFound() {
  return (
    <div className="relative flex h-screen flex-col bg-gray-50 font-poppins">
      {/* Hero-like 404 section */}
      <section className="relative h-screen flex-1 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-75"
          style={{
            backgroundImage: `url(${images.room})`,
          }}
        ></div>

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 px-6">
          <h1 className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-lg">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-white drop-shadow">
            Oops! Page Not Found
          </h2>
          <p className="text-white/90 max-w-md text-sm md:text-base leading-relaxed">
            It seems the page you’re looking for doesn’t exist or has been
            moved. Let’s get you back home safely.
          </p>

          <Link href="/" passHref>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer text-lg font-semibold px-8 py-4 rounded-full shadow-lg">
              Go Home
            </Button>
          </Link>
        </div>

        {/* Optional subtle overlay gradient */}
        <div className="absolute inset-0 bg-black/40"></div>
      </section>
    </div>
  );
}
