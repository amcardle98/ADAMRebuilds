import { Component, OnInit } from '@angular/core';
import { CarProject } from 'app/models/car-projects';
import { title } from 'process';

@Component({
  selector: 'app-rx8-page',
  templateUrl: './rx8-page.component.html',
  styleUrls: ['./rx8-page.component.scss']
})
export class Rx8PageComponent implements OnInit {
  title = 'rx8';
  text = 'this is an rx8 test';
  constructor() { }

  ngOnInit(): void {
  }

  getText() {
    return this.text;
  }

}
