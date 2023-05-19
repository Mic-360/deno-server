export interface UserSchema {
  id?: { $oid: string };
  email: string;
  password: string;
  createdAt: Date;
}
