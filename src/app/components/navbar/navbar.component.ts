import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  currentUser: User | null;

  photoURL: string | null;

  @Output() menuClick: EventEmitter<void> = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.WatchCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.photoURL = user?.photoURL ?? null;
    });
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }
}
