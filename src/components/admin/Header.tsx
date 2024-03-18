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
import { redirect } from "next/navigation";

async function Header() {
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
