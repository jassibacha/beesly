import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="py-20">
        <SignUp />
      </div>
    </div>
  );
}
