import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bmw-page',
  templateUrl: './bmw-page.component.html',
  styleUrls: ['./bmw-page.component.scss']
})
export class BmwPageComponent implements OnInit {
  text = "this is a bmw test";

  constructor() { }

  ngOnInit(): void {
  }

}
