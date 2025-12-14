export type DormListItem = {
  _id: string;
  title: string;
  description: string;
  profileImg?: string | null;
  roomType?: "private" | "double" | "shared" | null;
  city?: string;
  university?: string;
  pricePerNight?: number | null;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
};
