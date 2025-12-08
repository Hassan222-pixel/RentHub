"use client";

import { usePathname } from "next/navigation";
import TemplateHeader from "./TemplateHeader";
import TemplateFooter from "./TemplateFooter";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes where we hide header & footer
  const hideLayout =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")||
    pathname.startsWith("/renter");

  return (
    <>
      {!hideLayout && <TemplateHeader />}

      {children}

      {!hideLayout && <TemplateFooter />}
    </>
  );
}
