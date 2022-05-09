import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, take } from 'rxjs';
import { AuthService } from './services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenavContainer')
  sidenavContainerComponent: MatSidenavContainer;

  @ViewChild('sidenav')
  sidenavComponent: MatSidenav;

  authenticationLoaded = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.authService
      .WatchCurrentUser()
      .pipe(untilDestroyed(this), take(1))
      .subscribe((u) => {
        console.log('Loaded auth with user: ', u);
        this.authenticationLoaded = true;
      });
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavComponent.close();
      });
  }
}
