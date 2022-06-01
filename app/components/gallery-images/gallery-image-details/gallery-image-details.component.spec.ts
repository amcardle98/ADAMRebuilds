import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryImageDetailsComponent } from './gallery-image-details.component';

describe('GalleryImageDetailsComponent', () => {
  let component: GalleryImageDetailsComponent;
  let fixture: ComponentFixture<GalleryImageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryImageDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
