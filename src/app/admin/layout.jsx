import "../globals.css";
import { Epilogue } from "next/font/google";
import { LayoutProvider } from "@/lib/LayoutProvider";

const epilogue = Epilogue({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin area",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body data-theme="cupcake" className={`${epilogue.className} min-h-screen bg-base-100 text-base-content`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
