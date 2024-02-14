"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/dashboard") ? "" : "text-muted-foreground",
        )}
      >
        Overview
      </Link>
      <Link
        href="/dashboard/reports"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/dashboard/reports") ? "" : "text-muted-foreground",
        )}
      >
        Reports
      </Link>
      <Link
        href="/dashboard/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/dashboard/settings") ? "" : "text-muted-foreground",
        )}
      >
        Settings
      </Link>
    </nav>
  );
}
