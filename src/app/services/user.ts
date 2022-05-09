import { Roles, UserDocument } from 'app/models/user';
import { UserInfo } from 'firebase/auth';

export class User implements UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  roles: Roles;

  firebaseAuthData: UserInfo;

  constructor(authData: UserInfo, roles: Roles) {
    this.email = authData.email;
    this.photoURL = authData.photoURL;
    this.roles = roles;
    this.displayName = authData.displayName;
    this.emailVerified = true;
    this.uid = authData.uid;

    this.firebaseAuthData = authData;
  }
}
