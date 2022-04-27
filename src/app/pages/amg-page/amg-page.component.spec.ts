import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmgPageComponent } from './amg-page.component';

describe('AmgPageComponent', () => {
  let component: AmgPageComponent;
  let fixture: ComponentFixture<AmgPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmgPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmgPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
