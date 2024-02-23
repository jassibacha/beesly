export type DynamicEmailData = {
  toEmail: string;
  toName: string;
  fromEmail: string;
  fromName: string;
  replyEmail: string;
  replyName: string;
  subject: string;
  preheader: string;
  heading: string;
  textBody: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationName: string;
  locationPhone: string;
  locationEmail: string;
  // Add other fields as needed
};

export enum EmailTemplateType {
  BookingConfirmation,
  BookingUpdate,
}
