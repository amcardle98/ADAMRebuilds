import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmwPageComponent } from './bmw-page.component';

describe('BmwPageComponent', () => {
  let component: BmwPageComponent;
  let fixture: ComponentFixture<BmwPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BmwPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BmwPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
