import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import ApplicationModal from "@/components/applications/ApplicationModal";
import Toast from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ApplyWise - AI Job Application Manager",
  description: "AI-powered job application tracker, resume analyzer, and interview prep assistant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900`}>
        <ApplicationsProvider>
          {children}
          <ApplicationModal />
          <Toast />
        </ApplicationsProvider>
      </body>
    </html>
  );
}
