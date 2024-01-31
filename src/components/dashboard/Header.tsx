import { MainNav } from "./main-nav";
import { ModeToggle } from "./mode-toggle";
import { Search } from "./search";
import TeamSwitcher from "./team-switcher";
import { UserNav } from "./user-nav";

function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <TeamSwitcher />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <UserNav />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

export default Header;
