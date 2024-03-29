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

export default async function Home() {
  noStore();

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-black ">
        <MaxWidthWrapper className="flex flex-col items-center justify-center pb-12 pt-28 text-center sm:pt-40">
          {/* Hero Section */}
          <div className="flex max-w-4xl flex-col items-center py-10 text-center">
            <h1 className="mb-8 max-w-2xl text-6xl font-bold leading-tight">
              Effortlessly optimize your{" "}
              <span className="text-primary">VR bookings</span>
            </h1>
            <p className="mb-4 text-lg leading-relaxed text-slate-700 dark:text-white/85">
              Our advanced booking system is designed for VR lounges to manage
              appointments, group bookings, and station allocations efficiently,
              ensuring a seamless experience for both customers and lounge
              owners.
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
                <p className="text-lg text-primary">Happy Customers</p>
              </div>
              <div className="rounded-md bg-violet-100 p-6 shadow-md">
                <CalendarCheck2 className="mx-auto mb-2 h-16 w-16 text-primary" />
                <p className="mb-2 text-3xl font-extrabold text-primary">3K+</p>
                <p className="text-lg text-primary">Monthly Bookings</p>
              </div>
              <div className="rounded-md bg-violet-100 p-6 shadow-md">
                <Star className="mx-auto mb-2 h-16 w-16 text-primary" />
                <p className="mb-2 text-3xl font-extrabold text-primary">
                  100%
                </p>
                <p className="text-lg text-primary">Positive Feedback</p>
              </div>
              <div className="rounded-md bg-violet-100 p-6 shadow-md">
                <Clock className="mx-auto mb-2 h-16 w-16 text-primary" />
                <p className="mb-2 text-3xl font-extrabold text-primary">40%</p>
                <p className="text-lg text-primary">Save Time</p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="my-10 w-full">
            <div className="grid grid-cols-2 gap-20">
              <div className="flex flex-col items-center justify-center md:mb-0">
                <h2 className="mb-5 text-5xl font-bold">
                  <span className="text-primary">Smarter</span> scheduling for
                  your VR lounge
                </h2>
                <p className="mb-5 text-lg  leading-relaxed text-slate-700 dark:text-white/85">
                  Our smart system is designed to manage multiple VR station
                  bookings and group reservations with ease.
                </p>
                {/* <Button>Learn more</Button> */}
              </div>
              {/* Add image or placeholder here */}
              <div className="h-64 w-full rounded-md bg-gray-300"></div>
            </div>
          </section>

          {/* Upgrade Your VR Journey */}
          <section className="my-10 w-full">
            <div className="rounded-[20px] bg-primary p-12 text-white">
              <div className="flex flex-col items-center justify-center md:mb-0">
                <h2 className="mb-6 text-5xl font-bold text-white">
                  Upgrade Your VR Journey
                </h2>
                <p className="mb-6 max-w-2xl text-lg leading-relaxed text-white">
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
            <h2 className="mb-5 text-4xl font-bold">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <div className="grid grid-cols-3 gap-20">
              <div className="col-span-1 h-64 w-full rounded-md bg-gray-300">
                {/* Add image or placeholder here */}
              </div>
              <div className="col-span-2 flex flex-col items-center justify-center md:mb-0">
                <Accordion
                  type="single"
                  defaultValue="item-1"
                  collapsible
                  className="w-full bg-white"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="p-5 text-lg font-bold">
                      How does it optimize my lounge&apos;s operations?
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-left text-lg">
                      Our system streamlines your lounge&apos;s operations by
                      providing an intuitive booking platform, efficient
                      scheduling, and real-time updates. This allows for better
                      resource management, reduced wait times, and an enhanced
                      customer experience, ultimately leading to increased
                      profitability and customer satisfaction.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="p-5 text-lg font-bold">
                      Is customer and booking data secure with your system?
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-left text-lg">
                      Yes, customer and booking data security is our top
                      priority. Our system employs state-of-the-art encryption
                      and secure protocols to protect your data at all times. We
                      continuously monitor and update our security measures to
                      ensure the highest level of protection for your
                      information.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="p-5 text-lg font-bold">
                      Can I integrate with my current booking software?
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-left text-lg">
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
