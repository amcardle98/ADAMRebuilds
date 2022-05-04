import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GalleryData } from 'app/models/car-projects';
import { GalleryViewModel } from '../home-page.component';

@Component({
  selector: 'app-gallery-item-detail',
  templateUrl: './gallery-item-detail.component.html',
  styleUrls: ['./gallery-item-detail.component.scss'],
})
export class GalleryItemDetailComponent implements OnInit {
  currentGalleryItem?: GalleryViewModel;

  constructor(
    private readonly firestore: AngularFirestore,
    private readonly dialogRef: MatDialogRef<GalleryItemDetailComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly dialogData: GalleryViewModel
  ) {
    this.currentGalleryItem = dialogData;
  }

  ngOnInit(): void {}
}
