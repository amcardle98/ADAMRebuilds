import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Roles, UserDocument } from 'app/models/user';
import {
  AuthProvider,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { firstValueFrom, map, of, ReplaySubject, switchMap, take } from 'rxjs';
import { User } from '../services/user';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: User | null; // Save logged in user data
  private userData$ = new ReplaySubject<User | null>(1);

  constructor(
    private readonly afs: AngularFirestore, // Inject Firestore service
    private readonly afAuth: AngularFireAuth, // Inject Firebase auth service
    private readonly router: Router,
    private readonly ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    this.afAuth.user
      .pipe(
        untilDestroyed(this),
        switchMap((user) => {
          if (user) {
            return this.afs
              .collection('users')
              .doc(user.uid)
              .snapshotChanges()
              .pipe(
                map((snapshot) => {
                  const userDoc =
                    snapshot.payload.data() as Partial<UserDocument>;
                  const roles: Roles = userDoc.roles ?? { reader: true };

                  return new User(user, roles);
                })
              );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((user) => {
        this.userData$.next(user);
      });
  }
  // Sign in with email/password
  async SignIn(email: string, password: string) {
    const result = await this.afAuth.signInWithEmailAndPassword(
      email,
      password
    );

    if (!result.user) {
      throw new Error('Authentication failed');
    }

    this.SetUserData(result.user as FirebaseUser);
  }
  // Sign up with email/password
  async SignUp(email: string, password: string) {
    const result = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    /* Call the SendVerificaitonMail() function when new user sign
    up and returns promise */

    if (!result.user) {
      throw new Error('User creation failed.');
    }

    result.user.sendEmailVerification();

    await this.SetUserData(result.user as FirebaseUser);

    return result.user.uid;
  }

  // Reset Forggot password
  async ForgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  // Returns true when user is logged in and email is verified
  isLoggedIn(): Promise<boolean> {
    return firstValueFrom(
      this.userData$.pipe(
        take(1),
        map((user) => user !== null)
      )
    );
  }

  // Sign in with Google
  async GoogleAuth() {
    const res = await this.AuthLogin(new GoogleAuthProvider()).catch(
      () => null
    );
    if (res) {
      this.router.navigate(['home']);
    } else {
      throw new Error('Google authentication failed');
    }
  }

  // Auth logic to run auth providers
  async AuthLogin(provider: AuthProvider) {
    const result = await this.afAuth.signInWithPopup(provider);

    if (!result.user) {
      throw new Error('Authentication failed');
    }

    this.SetUserData(result.user as FirebaseUser);
    return result.user;
  }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  async SetUserData(user: FirebaseUser) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: UserDocument = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      roles: { reader: true },
    };
    await userRef.set(userData, {
      merge: true,
    });
  }

  // Sign out
  async SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    });
  }

  async resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  async verifyEmail(email: string) {
    return this.afAuth.sendSignInLinkToEmail(email, {
      url: window.location.origin,
    });
  }

  WatchCurrentUser() {
    return this.userData$.asObservable();
  }
}
