import dayjs from "dayjs";

export type Person = {
  _id: string;
  name: string;
  birthday: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  avatarUrl?: string;
  categories?: string[];
  pinned?: boolean;
};


export type PersonWithBirthday = Person & {
  birthdayThisYear: dayjs.Dayjs;
};
