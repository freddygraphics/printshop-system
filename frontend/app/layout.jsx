export const runtime = "nodejs";

import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import ProtectedLayout from "./ProtectedLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Freddy Graphics LLC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F5F7F9] text-gray-900`}>
        <Providers>
          <ProtectedLayout>{children}</ProtectedLayout>
        </Providers>
      </body>
    </html>
  );
}
