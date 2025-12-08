import "./globals.css";
import TemplateHeader from "./components/TemplateHeader";
import TemplateFooter from "./components/TemplateFooter";

export const metadata = {
  title: "RentHub",
  description: "Real estate platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TemplateHeader />
        {children}
        <TemplateFooter />
      </body>
    </html>
  );
}
