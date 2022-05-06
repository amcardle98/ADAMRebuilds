import { Injectable, NgZone } from '@angular/core';
import { User, Roles } from '../services/user';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import {
  filter,
  firstValueFrom,
  map,
  ReplaySubject,
  Subscription,
  take,
} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: User | null; // Save logged in user data
  private currentUserSubscription?: Subscription;
  private userData$ = new ReplaySubject<User | null>(1);

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.user.subscribe((user) => {
      this.currentUserSubscription?.unsubscribe();
      if (user) {
        this.currentUserSubscription = this.afs
          .collection('users')
          .doc(user.uid)
          .get()
          .pipe(
            map((userDoc) => {
              return new User(user, (userDoc.data() as any).roles as Roles);
            })
          )
          .subscribe({
            next: (u) => this.userData$.next(u),
          });
      } else {
        this.userData$.next(null);
      }
    });
  }
  // Sign in with email/password
  async SignIn(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      this.ngZone.run(() => {
        this.router.navigate(['home']);
      });
      this.SetUserData(result.user);
    } catch (error: any) {
      window.alert(error.message);
    }
  }
  // Sign up with email/password
  async SignUp(email: string, password: string) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      /* Call the SendVerificaitonMail() function when new user sign
      up and returns promise */
      this.SendVerificationMail();
      this.SetUserData(result.user);
    } catch (error: any) {
      window.alert(error.message);
    }
  }
  // Send email verfificaiton when new user sign up
  async SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }
  // Reset Forggot password
  async ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error: any) => {
        window.alert(error.message);
      });
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
    return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
      if (res) {
        this.router.navigate(['home']);
        console.log(res.authData);
      }
    });
  }
  // Auth logic to run auth providers
  async AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(async () => {
          //Wait for the user to be loaded, or else auth guard will still see no user
          await firstValueFrom(
            this.userData$.pipe(filter((user) => user !== null))
          );
          this.router.navigate(['home']);
        });
        this.SetUserData(result.user);
        console.log(result.user);
      })
      .catch((error: any) => {
        window.alert(error.message);
      });
  }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      roles: { reader: true },
      firebaseAuthData: null as any,
    };
    return userRef.set(userData, {
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

  WatchCurrentUser() {
    return this.userData$.asObservable();
  }
}
