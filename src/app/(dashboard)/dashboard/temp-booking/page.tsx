import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { syncUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default async function DashboardPage() {
  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Temp Booking</h2>
          <div className="flex items-center space-x-2">
            {/* <CalendarDateRangePicker />
            <Button>Download</Button> */}
          </div>
        </div>
        <Tabs defaultValue="book" className="space-y-4">
          <TabsList>
            <TabsTrigger value="book">Book</TabsTrigger>
          </TabsList>
          <TabsContent value="book" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Book Appt</CardTitle>
                  <CardDescription>
                    <p>Let&apos;s book an appointment.</p>

                    {/* <p>{book.success ? "Success" : "Failed"}</p> */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">Text goes here.</CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
