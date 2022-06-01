import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryItemDetailComponent } from './gallery-item-detail.component';

describe('GalleryItemDetailComponent', () => {
  let component: GalleryItemDetailComponent;
  let fixture: ComponentFixture<GalleryItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryItemDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
