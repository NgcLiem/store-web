import "./globals.css";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Providers from "../components/Providers";
import AppShell from "../components/AppShell";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "DONIDG",
  description: "Cửa hàng giày sneaker chính hãng",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        {/* FontAwesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <ToastProvider>
          <Providers>
            <AppShell>
              <main>{children}</main>
            </AppShell>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
