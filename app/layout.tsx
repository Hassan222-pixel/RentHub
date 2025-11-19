// app/layout.tsx
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "RentHub Admin",
  description: "RentHub Admin Dashboard with role-based access",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="renthub-body">{children}</body>
    </html>
  );
}
