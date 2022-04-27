import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyPageComponent } from './legacy-page.component';

describe('LegacyPageComponent', () => {
  let component: LegacyPageComponent;
  let fixture: ComponentFixture<LegacyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegacyPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegacyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
