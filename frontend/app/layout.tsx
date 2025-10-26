"use client";
import React from "react";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/dist/typography.min.js" strategy="beforeInteractive" />
        <Script id="tailwind-config" strategy="beforeInteractive">{`
          tailwind.config = {
            darkMode: 'class',
            theme: { extend: {} },
            plugins: [typography],
          }
        `}</Script>
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
