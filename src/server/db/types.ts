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
export type LocationSetting = InferSelectModel<typeof locationSettings>;
export type NewLocationSetting = InferInsertModel<typeof locationSettings>;
export type UpdateLocationSetting = Partial<
  InferInsertModel<typeof locationSettings>
>;

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
