import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  currentUser: User | null;

  @Output() menuClick: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.authService
      .WatchCurrentUser()
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }
}
