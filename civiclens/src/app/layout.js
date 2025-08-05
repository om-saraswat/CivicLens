import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers"; // 👈 Import the new wrapper
import NavbarClient from "../app/Components/NavbarClient"; // 👈 client wrapper for navbar
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Civic AI Agent",
  description: "Your AI assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800`}>
        <Providers>
          <NavbarClient />
          
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
