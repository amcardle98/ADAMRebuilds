export interface Roles {
  reader: boolean;
  author?: boolean;
  admin?: boolean;
}

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  roles: Roles;
}
