/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentHub",
  description: "Dormitory booking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Template CSS */}
        <link rel="stylesheet" href="/template/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/template/css/style.css" />
        <link rel="stylesheet" href="/template/css/responsive.css" />
        <link rel="stylesheet" href="/template/css/jquery.mCustomScrollbar.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
