import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { MainNav } from "./main-nav";
import { ModeToggle } from "./mode-toggle";
import { Search } from "./search";
import TeamSwitcher from "./team-switcher";
import { UserNav } from "./user-nav";
import Link from "next/link";

function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <TeamSwitcher />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          {/* <Search /> */}
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard/bookings/new">
              <PlusCircle className="mr-1 h-4 w-4" />
              New Booking
            </Link>
          </Button>
          <UserNav />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

export default Header;
