import { syncUser } from "@/lib/auth/utils";

export default async function SetupPage() {
  // Check & sync the currentUser to db if they don't exist
  const user = await syncUser();

  return <div>Setup page aka onboarding</div>;
}
