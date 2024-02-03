import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { ArrowRight, CalendarCheck2, Clock, Smile, Star } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignOutButton,
  SignUpButton,
} from "@clerk/nextjs";

export default async function Home() {
  noStore();
  return (
    <div className="min-h-screen bg-gray-100">
      <MaxWidthWrapper className="flex flex-col items-center justify-center pb-12 pt-28 text-center sm:pt-40">
        {/* Hero Section */}
        <div className="flex max-w-4xl flex-col items-center py-10 text-center">
          <h1 className="mb-8 max-w-2xl text-6xl font-bold leading-tight">
            Effortlessly optimize your{" "}
            <span className="text-primary">VR bookings</span>
          </h1>
          <p className="mb-4 leading-relaxed text-slate-700">
            Our advanced booking system is designed for VR lounges to manage
            appointments, group bookings, and station allocations efficiently,
            ensuring a seamless experience for both customers and lounge owners.
          </p>
          <Link
            href="/sign-up"
            className={buttonVariants({
              size: "lg",
              className: "mt-5 px-10 py-7 text-lg font-semibold",
            })}
          >
            Get started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Stats Section */}
        <section className="my-10 w-full ">
          <div className="grid w-full grid-cols-2 gap-6 text-center md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md bg-violet-100 p-6 shadow-md">
              <Smile className="mx-auto mb-2 h-16 w-16 text-primary" />
              <p className="mb-2 text-3xl font-extrabold text-primary">20+</p>
              <p className="text-lg">Happy Customers</p>
            </div>
            <div className="rounded-md bg-violet-100 p-6 shadow-md">
              <CalendarCheck2 className="mx-auto mb-2 h-16 w-16 text-primary" />
              <p className="mb-2 text-3xl font-extrabold text-primary">3K+</p>
              <p className="text-lg">Monthly Bookings</p>
            </div>
            <div className="rounded-md bg-violet-100 p-6 shadow-md">
              <Star className="mx-auto mb-2 h-16 w-16 text-primary" />
              <p className="mb-2 text-3xl font-extrabold text-primary">100%</p>
              <p className="text-lg">Positive Feedback</p>
            </div>
            <div className="rounded-md bg-violet-100 p-6 shadow-md">
              <Clock className="mx-auto mb-2 h-16 w-16 text-primary" />
              <p className="mb-2 text-3xl font-extrabold text-primary">40%</p>
              <p className="text-lg">Save Time</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="my-10 w-full">
          <div className="grid grid-cols-2 gap-20">
            <div className="flex flex-col items-center justify-center md:mb-0">
              <h2 className="mb-4 text-4xl font-bold">
                Smarter scheduling for your VR lounge
              </h2>
              <p className="mb-4 leading-relaxed text-slate-700">
                Our smart system is designed to manage multiple VR station
                bookings and group reservations with ease.
              </p>
              <Button>Learn more</Button>
            </div>
            {/* Add image or placeholder here */}
            <div className="h-64 w-full rounded-md bg-gray-300"></div>
          </div>
        </section>

        {/* How It Works Section */}
        {/* Repeat for each step */}
        <section className="my-10 text-center">
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
              <SignInButton>Sign In</SignInButton>
            </Button>
            <Button variant="default" size="sm" asChild>
              <SignUpButton>
                Get Started
                {/* <ArrowRight className="ml-1.5 h-5 w-5" /> */}
              </SignUpButton>
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
          <h2 className="mb-4 text-2xl font-bold">Sign Up and Customize</h2>
          <p>VR lounge owners can register for an account...</p>
        </section>

        {/* Call to Action Section */}
        <section className="bg-blue-600 py-10 text-center text-white">
          <h2 className="mb-2 text-3xl font-bold">Embark on Your VR Journey</h2>
          <p>Equip your lounge with our specialized VR scheduling platform.</p>
          <Button className="mt-4">Reserve Your Spot</Button>
        </section>

        {/* FAQ Section */}
        <section className="my-10">
          {/* This would be an accordion in ShadcnUI */}
          <div>
            <h3>What is a VR booking system?</h3>
            <p>
              A VR booking system is a software platform that allows VR lounge
              owners to manage their bookings.
            </p>
            {/* Repeat for other FAQs */}
          </div>
        </section>

        {/* What’s New Section */}
        <section className="my-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Repeat this div for each news item */}
            <div className="rounded-md bg-white p-4 shadow-md">
              <h3 className="mb-2 text-xl font-semibold">
                Introducing the Future of VR Bookings
              </h3>
              <p>
                Our latest update brings even more power to your scheduling.
              </p>
            </div>
            {/* ... */}
          </div>
        </section>

        {/* Footer Section */}
        <footer className="bg-white py-6 text-center">
          <p>Connect to the Next Level of VR Booking</p>
          {/* Add social media icons here */}
        </footer>
      </MaxWidthWrapper>
    </div>
  );
}

// export default async function Home() {
//   noStore();
//   const hello = await api.post.hello.query({ text: "from tRPC" });

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center ">
//       <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
//         <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
//           Homepage
//         </h1>
//         <div className="flex flex-col items-center gap-2">
//           <p className="text-2xl text-white">
//             {hello ? hello.greeting : "Loading tRPC query..."}
//           </p>
//         </div>

//         <CrudShowcase />
//       </div>
//     </main>
//   );
// }
