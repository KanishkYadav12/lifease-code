import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "FAQ Assistant",
  description: "A clean chat frontend for the Lifease FAQ assistant.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen text-slate-900 antialiased dark:text-slate-50">
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem('darkMode');
                const isDark = stored === 'true';
                document.documentElement.classList.toggle('dark', isDark);
              } catch (error) {}
            })();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
