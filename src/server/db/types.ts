import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  type users,
  type locations,
  type locationSettings,
  type resources,
  type bookings,
  type resourceBookings,
} from "./schema";

// User Types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UpdateUser = Partial<InferInsertModel<typeof users>>;

// Location Types
export type Location = InferSelectModel<typeof locations>;
export type NewLocation = InferInsertModel<typeof locations>;
export type UpdateLocation = Partial<InferInsertModel<typeof locations>>;

// LocationSettings Types
//export type LocationSetting = InferSelectModel<typeof locationSettings>;
// This automated infer was giving errors with the json fields, they were coming back as 'unknown' and messing with type safety from FE > BE

export type LocationSetting = {
  id: string;
  locationId: string;
  //timeZone: string;
  // This is a temporary fix for the trpc firing on booking email
  // Realistically we should either modularize the string>object conversion
  // Or we should parse the dailyAvailability string and taxSettings in the trpc
  // That fetches locationSettings in the first place
  dailyAvailability: string; // in db these are a json string
  taxSettings: string; // in db these are a json string

  //dailyAvailability: Record<string, { open: string; close: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //taxSettings: Record<string, any>;
  initialCostOfBooking: string;
  initialBookingLength: number;
  bookingLengthIncrements: number;
  maxAdvanceBookingDays: number;
  sameDayLeadTimeBuffer: number;
  bufferTime: number;
  timeSlotIncrements: number;
  displayUnavailableSlots: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewLocationSetting = InferInsertModel<typeof locationSettings>;
export type UpdateLocationSetting = Partial<
  InferInsertModel<typeof locationSettings>
>;
// export type DailyAvailability = Partial<
//   Record<
//     | "Monday"
//     | "Tuesday"
//     | "Wednesday"
//     | "Thursday"
//     | "Friday"
//     | "Saturday"
//     | "Sunday",
//     { open: string; close: string }
//   >
// >;
// export type ExtendedLocationSetting = LocationSetting & {
//   dailyAvailability: DailyAvailability;
// };

// Resource Types
export type Resource = InferSelectModel<typeof resources>;
export type NewResource = InferInsertModel<typeof resources>;
export type UpdateResource = Partial<InferInsertModel<typeof resources>>;

// Booking Types
export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;
export type UpdateBooking = Partial<InferInsertModel<typeof bookings>>;

// ResourceBooking Types
export type ResourceBooking = InferSelectModel<typeof resourceBookings>;
export type NewResourceBooking = InferInsertModel<typeof resourceBookings>;
export type UpdateResourceBooking = Partial<
  InferInsertModel<typeof resourceBookings>
>;
