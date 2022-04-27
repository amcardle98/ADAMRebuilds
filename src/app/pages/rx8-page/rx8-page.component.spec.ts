import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rx8PageComponent } from './rx8-page.component';

describe('Rx8PageComponent', () => {
  let component: Rx8PageComponent;
  let fixture: ComponentFixture<Rx8PageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Rx8PageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Rx8PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
