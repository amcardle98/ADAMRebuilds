import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/services/auth.service';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required]);

  loginFormGroup = new FormGroup({
    email: this.emailControl,
    password: this.passwordControl,
  });

  loadingNavigation$ = new BehaviorSubject<boolean>(false);

  errorMessages$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  waitingForGoogleAuth$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  async signUpTraditional() {
    this.errorMessages$.next([]);

    this.loginFormGroup.markAllAsTouched();
    this.loginFormGroup.disable();

    if (this.loginFormGroup.invalid) {
      return;
    }

    try {
      await this.authService.SignUp(
        this.emailControl.value,
        this.passwordControl.value
      );

      await this.getUserAndNavigate();
    } catch (error: any) {
      this.errorMessages$.next([error.message]);
    }

    this.loginFormGroup.enable();
  }

  async loginGoogle() {
    this.errorMessages$.next([]);

    this.loginFormGroup.disable();

    this.waitingForGoogleAuth$.next(true);

    try {
      await this.authService.GoogleAuth();

      await this.getUserAndNavigate();
    } catch (error: any) {
      this.errorMessages$.next([error.message]);
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
