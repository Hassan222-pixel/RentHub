/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
export const dynamic = "force-dynamic";
import "mapbox-gl/dist/mapbox-gl.css";


export const metadata: Metadata = {
  title: "RentHub",
  description: "Dormitory booking platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/template/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/template/css/style.css" />
        <link rel="stylesheet" href="/template/css/responsive.css" />
        <link
          rel="stylesheet"
          href="/template/css/jquery.mCustomScrollbar.min.css"
        />
      </head>

      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
