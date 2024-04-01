import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { ArrowRight, CalendarCheck2, Clock, Smile, Star } from "lucide-react";
import Footer from "@/components/landing/LandingFooter";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beesly - Optimize Your VR Bookings",
  description:
    "Effortlessly manage and optimize your VR lounge bookings with Beesly.",
  openGraph: {
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beesly - Optimize Your VR Bookings",
      },
    ],
  },
};

export default function Home() {
  noStore();

  return (
    <>
      {/* Hero Section */}
      <div className="flex w-full items-center justify-center bg-gradient-to-tr from-violet-100 to-violet-300">
        <div className="flex max-w-4xl flex-col items-center pt-16 text-center">
          <h1 className="mb-8 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            Effortlessly optimize your{" "}
            <span className="text-primary">VR bookings</span>
          </h1>
          <p className="mb-4 text-base leading-relaxed text-slate-700 dark:text-white/85 md:text-lg">
            Our advanced booking system is designed for VR lounges to manage
            appointments, group bookings, and station allocations efficiently,
            ensuring a seamless experience for both customers and lounge owners.
          </p>
          <Link
            href="/sign-up"
            className={buttonVariants({
              size: "lg",
              className: "mb-4 mt-5 px-10 py-7 text-lg font-semibold",
            })}
          >
            Get started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Image src="/hero-image.png" alt="Beesly" width={600} height={337} />
        </div>
      </div>
      <div className="min-h-screen bg-gray-100 dark:bg-black ">
        <MaxWidthWrapper className="flex flex-col items-center justify-center pb-12 pt-12 text-center sm:pt-12">
          {/* Stats Section */}
          <section className="my-10 w-full ">
            <div className="grid w-full grid-cols-2 gap-6 text-center md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-violet-100 p-4 shadow-md md:p-6">
                <Smile className="mx-auto mb-2 h-12 w-12 text-primary md:h-16 md:w-16" />
                <p className="mb-2 text-2xl font-extrabold text-primary md:text-3xl">
                  20+
                </p>
                <p className="text-base text-primary md:text-lg">
                  Happy Customers
                </p>
              </div>
              <div className="rounded-md bg-violet-100 p-4 shadow-md md:p-6">
                <CalendarCheck2 className="mx-auto mb-2 h-12 w-12 text-primary md:h-16 md:w-16" />
                <p className="mb-2 text-2xl font-extrabold text-primary md:text-3xl">
                  3K+
                </p>
                <p className="text-base text-primary md:text-lg">
                  Monthly Bookings
                </p>
              </div>
              <div className="rounded-md bg-violet-100 p-4 shadow-md md:p-6">
                <Star className="mx-auto mb-2 h-12 w-12 text-primary md:h-16 md:w-16" />
                <p className="mb-2 text-2xl font-extrabold text-primary md:text-3xl">
                  100%
                </p>
                <p className="text-base text-primary md:text-lg">
                  Positive Feedback
                </p>
              </div>
              <div className="rounded-md bg-violet-100 p-4 shadow-md md:p-6">
                <Clock className="mx-auto mb-2 h-12 w-12 text-primary md:h-16 md:w-16" />
                <p className="mb-2 text-2xl font-extrabold text-primary md:text-3xl">
                  40%
                </p>
                <p className="text-base text-primary md:text-lg">Save Time</p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="my-10 max-w-[1000px]">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-20">
              <div className="flex flex-col items-center justify-center md:mb-0">
                <h2 className="mb-5 text-3xl font-bold md:text-5xl">
                  <span className="text-primary">Smarter</span> scheduling for
                  your VR lounge
                </h2>
                <p className="mb-5 text-base leading-relaxed text-slate-700 dark:text-white/85 md:text-lg">
                  Our smart system is designed to manage multiple VR station
                  bookings and group reservations with ease.
                </p>
                {/* <Button>Learn more</Button> */}
              </div>
              {/* Add image or placeholder here */}
              <div className="flex justify-center">
                <Image
                  src="/vr-goggles.png"
                  alt="VR Goggles"
                  width={800}
                  height={638}
                  loading="lazy"
                  className="w-full max-w-[400px] md:w-auto"
                />
              </div>
            </div>
          </section>

          {/* Upgrade Your VR Journey */}
          <section className="my-10 w-full">
            <div className="rounded-[20px] bg-primary p-12 text-white">
              <div className="flex flex-col items-center justify-center md:mb-0">
                <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
                  Upgrade Your VR Journey
                </h2>
                <p className="mb-6 max-w-2xl text-base leading-relaxed text-white md:text-lg">
                  Leverage our specialized VR scheduling platform to orchestrate
                  your lounge&apos;s reservations, events, and customer
                  experiences. Equipped with smart reminders and the ability to
                  synchronize across all devices, our system keeps your
                  lounge&apos;s schedule in perfect harmony.
                </p>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/sign-up">Sign Up Now!</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="my-10 w-full">
            <h2 className="mb-5 text-2xl font-bold md:text-4xl">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-20">
              <div className="flex flex-col items-center justify-center md:order-last md:col-span-2 md:mb-0">
                <Accordion
                  type="single"
                  defaultValue="item-1"
                  collapsible
                  className="w-full bg-white"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="p-5 text-base font-bold md:text-lg">
                      How does it optimize my lounge&apos;s operations?
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-left text-base md:text-lg">
                      Our system streamlines your lounge&apos;s operations by
                      providing an intuitive booking platform, efficient
                      scheduling, and real-time updates. This allows for better
                      resource management, reduced wait times, and an enhanced
                      customer experience, ultimately leading to increased
                      profitability and customer satisfaction.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="p-5 text-base font-bold md:text-lg">
                      Is customer and booking data secure with your system?
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-left text-base md:text-lg">
                      Yes, customer and booking data security is our top
                      priority. Our system employs state-of-the-art encryption
                      and secure protocols to protect your data at all times. We
                      continuously monitor and update our security measures to
                      ensure the highest level of protection for your
                      information.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="p-5 text-base font-bold md:text-lg">
                      Can I integrate with my current booking software?
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-left text-base md:text-lg">
                      Integration with existing booking software is on our
                      roadmap, but currently, our app is designed to be a
                      comprehensive standalone solution for booking and managing
                      your lounge operations. We aim to provide all the
                      necessary tools in one seamless platform, making the
                      transition as smooth as possible for our users.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <div className="order-last flex items-center justify-center pt-8 md:order-first md:col-span-1 md:pt-0">
                <Image
                  src="/woman-in-vr-headset.png"
                  alt="Woman In VR Headset"
                  width={800}
                  height={777}
                  loading="lazy"
                  className="md:max-w-auto w-full max-w-[400px]"
                />
              </div>
            </div>
          </section>
        </MaxWidthWrapper>
      </div>
      {/* Footer */}
      <Footer />
    </>
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
