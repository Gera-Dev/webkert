export interface User {
  id: string;
  email: string;
  password?: string;
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin?: Date;
  active: boolean;
}
