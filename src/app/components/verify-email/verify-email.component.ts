import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';

@UntilDestroy()
@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  currentUser: User | null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    this.authService
      .WatchCurrentUser()
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  resendEmail() {
    if (!this.currentUser || !this.currentUser.email) {
      return;
    }

    this.authService.verifyEmail(this.currentUser.email);
  }
}
