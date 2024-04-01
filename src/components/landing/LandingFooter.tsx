import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { faCalendarDays, faHeart } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className="background-blur-lg w-full bg-white/75 transition-all dark:bg-black/75">
      {/* <MaxWidthWrapper> */}
      <div className="container mx-auto">
        {/* Main Footer */}
        <div className="flex items-center justify-between border-b pb-8 pt-12">
          <div className="flex flex-col">
            <div className="mb-4 flex items-center text-4xl font-bold ">
              <FontAwesomeIcon
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                icon={faCalendarDays}
                className="mr-2 inline h-7 w-7 text-primary"
              />
              Beesly
            </div>
            <div className="grid grid-cols-1 sm:gap-5 md:grid-cols-3 md:gap-20">
              <div className="col-span-1 mb-4 md:col-span-2">
                Beesly is your premier VR lounge management solution. Streamline
                your bookings and optimize your operations with our intuitive
                platform.
              </div>
              <div className="col-span-1 flex space-x-4 md:col-span-1 md:text-right">
                <FontAwesomeIcon icon={faFacebookF} className="h-6 w-6" />
                <FontAwesomeIcon icon={faTwitter} className="h-6 w-6" />
                <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
                <FontAwesomeIcon icon={faLinkedinIn} className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="flex "></div>
        </div>
        {/* Sub Footer */}

        <div className="flex flex-col items-center justify-between py-4 md:flex-row">
          <div className="">
            Copyright &copy; {new Date().getFullYear()} Beesly. All rights
            reserved.
          </div>
          <div className="flex items-center">
            Made with{" "}
            <FontAwesomeIcon
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              icon={faHeart}
              className="mx-1 inline h-4 w-4 text-red-500 "
            />{" "}
            in Vancouver, Canada.
          </div>
        </div>
      </div>
      {/* </MaxWidthWrapper> */}
    </footer>
  );
}
