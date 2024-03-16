import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
//import { MainNav } from "./main-nav";
import { ModeToggle } from "../dashboard/mode-toggle";
//import { Search } from "./search";
//import TeamSwitcher from "./team-switcher";
import { UserNav } from "../dashboard/user-nav";
import Link from "next/link";
//import { NewBookingDialog } from "./bookings/NewBookingDialog";
//import { NewBooking } from "./bookings/NewBooking";
import { syncUser } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

async function Header() {
  // // Check currentUser
  // const user = await syncUser();
  // // If no user, redirect to sign-in
  // if (!user) {
  //   redirect("/sign-in");
  // }
  // // If user is not the owner, redirect to dashboard
  // if (user.id !== process.env.OWNER_ID) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="title font-bold">Admin Area</div>
        {/* <TeamSwitcher />
        <MainNav className="mx-6" /> */}
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

export default Header;
