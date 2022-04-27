import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  currentUser: User | null;

  photoURL: string | null;

  constructor(public authService: AuthService) { 
  }

  ngOnInit(): void {
    this.authService.WatchCurrentUser().subscribe(user => {
      this.photoURL = user?.photoURL ?? null; 
    });
  }

}
