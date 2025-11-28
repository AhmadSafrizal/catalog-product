"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const LayoutProvider = ({ children }) => {
  const pathname = usePathname();
  const excludedPaths = ["/admin/login", "/admin/register"];
  const showNavbar = !excludedPaths.includes(pathname);
  const router = useRouter();

  useEffect(() => {
    // simple auth guard for admin routes using cookie
    try {
      if (pathname && pathname.startsWith("/admin") && !excludedPaths.includes(pathname)) {
        const match = document.cookie.match(/(^|;)\s*adminAccessToken=([^;]+)/);
        if (!match) {
          router.push("/admin/login");
        }
      }
    } catch (e) {
      // ignore on server
    }
  }, [pathname, router]);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};
