import { Toaster } from "@multiclubes/ui/components/toast";
import { TooltipProvider } from "@multiclubes/ui/components/tooltip";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Mosaico",
    template: "%s - Mosaico",
  },
  description: "Mosaico, o design system da Multiclubes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} [--header-height:calc(var(--spacing)*14)] lg:[--header-height:calc(var(--spacing)*16)]`}
    >
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster>{children}</Toaster>
            <SonnerToaster position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
