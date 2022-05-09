import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserDocument } from 'app/models/user';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { map, Subscription } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.scss'],
})
export class ProfileIconComponent implements OnInit, OnChanges {
  @Input()
  userUid: string | null | undefined = null;

  targetUserSubscription?: Subscription;

  currentUser: User | null = null;

  backgroundImageUrl: string = 'unset';

  constructor(
    private readonly firestore: AngularFirestore,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService
      .WatchCurrentUser()
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userUid']) {
      this.updateUserSubscription(changes['userUid'].currentValue);
    }
  }

  logOut() {
    if (this.currentUser && this.currentUser?.uid === this.userUid) {
      this.authService.SignOut();
    }
  }

  private updateUserSubscription(uid: string | null | undefined) {
    if (this.targetUserSubscription) {
      this.targetUserSubscription.unsubscribe();
      delete this.targetUserSubscription;
    }

    this.backgroundImageUrl = 'unset';

    if (!uid) {
      return;
    }

    this.targetUserSubscription = this.firestore
      .doc(`users/${uid}`)
      .snapshotChanges()
      .pipe(
        untilDestroyed(this),
        map((user) => {
          return (user.payload.data() ?? null) as UserDocument | null;
        })
      )
      .subscribe((user) => {
        this.backgroundImageUrl = user?.photoURL
          ? `url(${user.photoURL})`
          : 'unset';
      });
  }
}
