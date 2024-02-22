import { ArrowRight } from "lucide-react";
import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";
import { Button, buttonVariants } from "../ui/button";
// import MobileNav from "./MobileNav";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignOutButton,
  SignUpButton,
} from "@clerk/nextjs";

async function Header() {
  return (
    <nav className="background-blur-lg sticky inset-x-0 top-0 z-30 h-14 w-full border-b bg-white/75 transition-all dark:bg-black/75">
      {/* <MaxWidthWrapper> */}
      <div className="container mx-auto">
        <div className="border- flex h-14 items-center justify-between">
          <Link href="/" className="z-40 flex font-semibold">
            <span>Beesly</span>
          </Link>

          {/* <MobileNav isAuth={!!user} /> */}

          {/* <div className="hidden items-center space-x-4 sm:flex"> */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              {/* <Link
              href="/pricing"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              Pricing
            </Link> */}
              <Button variant="ghost" size="sm" asChild>
                {/* <SignInButton>Sign In</SignInButton> */}
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/sign-up">
                  Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
      {/* </MaxWidthWrapper> */}
    </nav>
  );
}

export default Header;
