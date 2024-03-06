import type { Location } from "@/server/db/types";

interface HeaderProps {
  location: Location;
}

export default async function Page({ location }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-center p-4">
      <div className="text-center">
        {location.logo ? (
          <img
            src={location.logo}
            alt={location.name}
            className="h-12 w-auto"
          />
        ) : (
          <h1 className="text-2xl font-bold">{location.name}</h1>
        )}
      </div>
    </header>
  );
}
