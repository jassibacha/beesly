import { syncUser } from "@/lib/auth/utils";
import CreateLocationForm from "./_components/CreateLocationForm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SetupPage() {
  // Check & sync the currentUser to db if they don't exist
  const user = await syncUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.onboarded) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="max-w-3xl space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Setup Your Business
          </h2>
        </div>
        <Card className="">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="">
            <Suspense fallback={<div>Loading...</div>}>
              <CreateLocationForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
