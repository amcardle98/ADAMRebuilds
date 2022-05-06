import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('sidenavContainer')
  sidenavContainerComponent: MatSidenavContainer;

  @ViewChild('sidenav')
  sidenavComponent: MatSidenav;

  constructor(private readonly router: Router) {}

  ngAfterViewInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavComponent.close();
      });
  }
}
