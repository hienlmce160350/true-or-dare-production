import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/utils/react-query/query-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LuSparkles, LuZap } from "react-icons/lu";
import SnackbarProvider from "@/components/snackbar/snackbar-provider";
import { SettingsThemeValueProps } from "@/components/settings/types";
import { SettingsProvider } from "@/components/settings/context/settings-provider";
import GuidInitializer from "@/components/guid-initializer/page";
import SignalRProvider from "@/components/hook-form/signalr-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Truth or Dare",
  manifest: '/manifest.json',
  description: "Truth or Dare",
};

const defaultSettings: SettingsThemeValueProps = {
  themeMode: "light", // 'light' | 'dark'
  themeDirection: "ltr", //  'rtl' | 'ltr'
  themeContrast: "default", // 'default' | 'bold'
  themeLayout: "vertical", // 'vertical' | 'horizontal' | 'mini'
  themeColorPresets: "default", // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
  themeStretch: false,
  themeCustomColor: "",
  themeFontFamily: "Inter Variable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the SignalR server URL from environment variables
  const signalRUrl =
    process.env.NEXT_PUBLIC_HOST_API || "https://your-signalr-server.com";
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <SettingsProvider defaultSettings={defaultSettings}>
            <SignalRProvider serverUrl={signalRUrl}>
              <SnackbarProvider>
                <GuidInitializer /> {/* Khởi tạo GUID trên mọi trang */}
                <div className="m-auto font-[family-name:var(--font-geist-sans)]">
                  <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-purple-800 to-blue-500 p-6">
                    <div className="mb-8 flex flex-col items-center">
                      <div className="relative flex items-center gap-3 text-4xl font-extrabold tracking-tighter text-white md:text-5xl lg:text-6xl">
                        {/* Phần TRUTH */}
                        <span className="group relative transition-all duration-300 hover:scale-110">
                          TRUTH
                          <LuSparkles className="absolute -right-6 -top-4 h-6 w-6 text-yellow-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </span>
                        <span className="text-2xl font-light md:text-3xl lg:text-4xl">
                          or
                        </span>
                        {/* Phần DARE */}
                        <span className="group relative transition-all duration-300 hover:scale-110">
                          DARE
                          <LuZap className="absolute -right-6 -top-4 h-6 w-6 text-red-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </span>
                      </div>
                      <p className="mt-2 text-center text-sm font-medium text-blue-100 md:text-base">
                        The ultimate party game of choices and challenges
                      </p>
                    </div>
                    {children}
                  </div>
                </div>
              </SnackbarProvider>
            </SignalRProvider>
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
