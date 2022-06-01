import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar-button',
  templateUrl: './navbar-button.component.html',
  styleUrls: ['./navbar-button.component.scss']
})
export class NavbarButtonComponent implements OnInit {

  @Input() text: string | undefined;
  @Input() btnClass: string | undefined;
  @Output() onClick = new EventEmitter<string>();

  constructor() { 
  }

  ngOnInit(): void {
  }

  emitEvent() {
  }

}
