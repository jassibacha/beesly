import { DateTime } from "luxon";

// Grab the userId from the env file to link the seed data correctly
export const ownerId = process.env.OWNER_ID ?? "user_test_asx79aSjsx7U";
export const secondOwnerId = "user_2dhWGn0tHmypX1jC7jA2eFHMLdt"; // Second throwaway clerk user for testing

export const location1Id = "27edff40-b49c-4b18-a3ae-b813b42dadca";
export const location2Id = "a21bc8d0-7e8c-4c96-b788-393cfc2ead35";
export const resource1Id = "bb9996c8-8a42-448a-8f6a-1508723f8831";
export const resource2Id = "95d6f509-e298-4d49-98ff-a3f1e110b79c";

export const user1 = {
  id: ownerId,
  email: "klikster@gmail.com",
  username: "ownerUsername",
  displayName: "J B",
  userImage: "https://example.com/user_image.jpg",
  onboarded: true,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
  createdAt: DateTime.now().setZone("America/Los_Angeles").toJSDate(),
  updatedAt: DateTime.now().setZone("America/Los_Angeles").toJSDate(),
};
export const user2 = {
  id: secondOwnerId,
  email: "jassi@sugoii.co",
  username: "randy",
  displayName: "Randy Marsh",
  userImage: "https://example.com/user_image.jpg",
  onboarded: true,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
  createdAt: DateTime.now().setZone("America/New_York").toJSDate(),
  updatedAt: DateTime.now().setZone("America/New_York").toJSDate(),
};
export const location1 = {
  name: "Evolve Virtual Reality",
  slug: "evolve",
  type: "VR Arcade",
  phone: "236-772-9873",
  email: "email@evolvevr.ca",
  website: "https://www.evolvevr.ca",
  streetAddress: "411 W Broadway",
  city: "Vancouver",
  state: "BC",
  zipCode: "V5Y 1R4",
  country: "Canada",
  timezone: "America/Los_Angeles",
  logo: "https://pub-a8bff496fa524be3b69903c9c9aeb879.r2.dev/evolve/logo-1708473130465.png",
};
export const location2 = {
  name: "Escape Virtual",
  slug: "escape",
  type: "VR Arcade",
  phone: "212-300-0075",
  email: "hello@escapevirtual.io",
  website: "https://www.escapevirtual.io",
  streetAddress: "130 W 29th St",
  city: "New York",
  state: "New York",
  zipCode: "10001",
  country: "USA",
  timezone: "America/New_York",
  logo: "https://pub-a8bff496fa524be3b69903c9c9aeb879.r2.dev/escape/logo-1710470513529.png",
};
export const settings = {
  dailyAvailability: JSON.stringify({
    Monday: { open: "09:00", close: "23:00", isOpen: true },
    Tuesday: { open: "09:00", close: "23:00", isOpen: true },
    Wednesday: { open: "09:00", close: "23:00", isOpen: true },
    Thursday: { open: "09:00", close: "23:00", isOpen: true },
    Friday: { open: "09:00", close: "23:00", isOpen: true },
    Saturday: { open: "09:00", close: "23:00", isOpen: true },
    Sunday: { open: "09:00", close: "23:00", isOpen: true },
  }),
  taxSettings: "12.50",
  //taxSettings: JSON.stringify({ VAT: 20 }),
  initialCostOfBooking: "100.0",
  initialBookingLength: 60,
  bookingLengthIncrements: 30,
  maxAdvanceBookingDays: 30,
  sameDayLeadTimeBuffer: 120,
  //minTimeBetweenBookings: 15,
  bufferTime: 10,
  timeSlotIncrements: 15,
  displayUnavailableSlots: false,
};
