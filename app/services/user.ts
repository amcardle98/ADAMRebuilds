import { AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { UserInfo } from "firebase/auth";

export interface Roles {
    reader: boolean;
    author?: boolean;
    admin?: boolean;
}

export class User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    roles: Roles;

    firebaseAuthData: UserInfo;

    constructor(authData: UserInfo, roles: Roles) {
        this.email = authData.email
        this.photoURL = authData.photoURL
        this.roles = roles
        this.displayName = authData.displayName
        this.emailVerified = true;
        this.uid = authData.uid;

        this.firebaseAuthData = authData;
    }
 }
