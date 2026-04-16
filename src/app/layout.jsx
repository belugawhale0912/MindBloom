import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { ToastProvider } from "@/components/ui/toast-custom";
import { ReminderWatcher } from "@/components/reminder-watcher";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "MindBloom",
  description: "A gentle mental health companion",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={cn(`${jakarta.variable} ${inter.variable} h-full antialiased`)}

      // From here used to change the dark mode

      suppressHydrationWarning // to allow react to accept <html class="dark"> from the script without hydration issues
      // dangerouslySetInnerHTML is used to allow javascript added into the component before rendered using react 
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
{/* To Here */}

      <body className="font-sans h-full flex overflow-hidden bg-background">
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
      </body>
    </html>
  );
}
