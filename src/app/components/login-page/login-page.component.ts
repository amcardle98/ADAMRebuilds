import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/services/auth.service';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
} from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required]);

  loginFormGroup = new FormGroup({
    email: this.emailControl,
    password: this.passwordControl,
  });

  loadingNavigation$ = new BehaviorSubject<boolean>(false);

  statusMessages$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(
    []
  );

  waitingForGoogleAuth$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loginFormGroup.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => {
          return prev.email === curr.email && prev.password === curr.password;
        })
      )
      .subscribe((valueChange) => {
        console.log(valueChange);
        this.statusMessages$.next([]);
      });
  }

  async loginTraditional() {
    this.statusMessages$.next([]);

    this.loginFormGroup.markAllAsTouched();

    if (this.loginFormGroup.invalid) {
      return;
    }

    this.loginFormGroup.disable();

    try {
      await this.authService.SignIn(
        this.emailControl.value,
        this.passwordControl.value
      );

      await this.getUserAndNavigate();
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.statusMessages$.next(['User not found']);
      } else if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-email'
      ) {
        this.statusMessages$.next(['Invalid email or password']);
      }

      console.error(error);
    }

    this.loginFormGroup.enable();
  }

  async loginGoogle() {
    this.statusMessages$.next([]);

    this.loginFormGroup.disable();

    this.waitingForGoogleAuth$.next(true);

    try {
      await this.authService.GoogleAuth();

      await this.getUserAndNavigate();
    } catch (error: any) {
      this.statusMessages$.next([error.message]);
      console.log(error);
    }

    this.waitingForGoogleAuth$.next(false);

    this.loginFormGroup.enable();
  }

  private async getUserAndNavigate() {
    this.loadingNavigation$.next(true);

    const nonNullUser = await firstValueFrom(
      this.authService.WatchCurrentUser().pipe(
        untilDestroyed(this),
        filter((user) => user !== null)
      )
    );

    this.router.navigate(['/home']);

    this.loadingNavigation$.next(false);
  }
}
