// import { CroppedImageProvider } from "./CroppedImageContext";
// import { FormProvider } from "./FormContext";
import { TimezoneProvider } from "./TimezoneContext";

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TimezoneProvider>{children}</TimezoneProvider>;
}
