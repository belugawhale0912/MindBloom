import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { ToastProvider } from "@/components/ui/toast-custom";
import { ReminderWatcher } from "@/components/reminder-watcher";
import { ThemeInitializer } from "@/components/theme-initializer";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

import Script from "next/script";

export const metadata = {
  title: "MindBloom",
  description: "A gentle mental health companion",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={cn(`${jakarta.variable} ${inter.variable} h-full antialiased`)}
      suppressHydrationWarning
    >
      <body className="font-sans h-full flex overflow-hidden bg-background">
        <ThemeInitializer />
        <ToastProvider>
          <ReminderWatcher />
          <Sidebar />
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            <TopNavbar />
            <main className="flex-1 overflow-y-auto w-full">
              <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 w-full">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>

        {/* Persistent Google Translate Element (hidden by default, shown via CSS on settings page) */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>

        {/* Google Translate Scripts */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'zh-CN,en,ms,ja,ru,ar',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }

            // Fix for Google Translate + React DOM conflict
            if (typeof Node === 'function' && Node.prototype) {
              const originalRemoveChild = Node.prototype.removeChild;
              Node.prototype.removeChild = function(child) {
                if (child.parentNode !== this) {
                  return child;
                }
                return originalRemoveChild.apply(this, arguments);
              };

              const originalInsertBefore = Node.prototype.insertBefore;
              Node.prototype.insertBefore = function(newNode, referenceNode) {
                if (referenceNode && referenceNode.parentNode !== this) {
                  return newNode;
                }
                return originalInsertBefore.apply(this, arguments);
              };
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
