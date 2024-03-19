"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";

export function UserNav() {
  // We're using clerk's useUser hook to get the user
  // To get up-to-date data to display in here
  // Anywhere else we'll use our own useUser hook
  const { isLoaded, user: clerkUser } = useUser();

  // Force redirect to sign-in page when user signs out
  const handleSignOut = () => {
    // Fully reload the page to force re-rendering
    window.location.href = "/sign-in";
    //router.push("/sign-in");
  };

  return (
    <SignedIn>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {isLoaded ? (
                clerkUser?.imageUrl ? (
                  <AvatarImage
                    src={clerkUser.imageUrl}
                    alt={clerkUser.firstName ?? "User"}
                  />
                ) : (
                  <AvatarFallback>
                    {clerkUser?.firstName?.[0] ?? "U"}
                  </AvatarFallback>
                )
              ) : (
                <AvatarFallback></AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {clerkUser?.firstName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {clerkUser?.emailAddresses[0]?.emailAddress ?? "No email"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignOutButton signOutCallback={handleSignOut}>
              Log out
            </SignOutButton>

            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SignedIn>
  );
}
