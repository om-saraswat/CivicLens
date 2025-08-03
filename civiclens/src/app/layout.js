import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers"; // 👈 Import the new wrapper
import NavbarClient from "../app/Components/NavbarClient"; // 👈 client wrapper for navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Civic AI Agent",
  description: "Your AI assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <NavbarClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}
