import { syncUser } from "@/lib/auth/utils";
import CreateLocationForm from "./_components/CreateLocationForm";
import { redirect } from "next/navigation";

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
      <div>Setup page aka onboarding</div>
      <CreateLocationForm />
    </>
  );
}
