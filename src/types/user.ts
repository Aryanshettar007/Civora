export type UserRole = "citizen" | "authority" | "admin";

export interface IUser {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  jurisdiction?: string;
  department?: string;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
