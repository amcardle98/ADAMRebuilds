import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { CarProject, GalleryData } from 'app/models/car-projects';
import {
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  Subscription,
} from 'rxjs';
import { GalleryImageDetailsComponent } from './gallery-image-details/gallery-image-details.component';

export type ExtendedGalleryData = GalleryData & {
  imageUrl: string;
  projectId: string;
};

@Component({
  selector: 'app-gallery-images',
  templateUrl: './gallery-images.component.html',
  styleUrls: ['./gallery-images.component.scss'],
})
export class GalleryImagesComponent implements OnInit, OnChanges {
  @Input() projectId: string;

  extendedGalleryData: Array<ExtendedGalleryData> = [];
  galleryDataSubscription?: Subscription;

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.getGalleryImages(this.projectId);
    }
  }

  openGalleryImage(image: ExtendedGalleryData) {
    this.dialog.open(GalleryImageDetailsComponent, {
      data: image,
    });
  }

  async getGalleryImages(projectId: string) {
    this.galleryDataSubscription?.unsubscribe();

    console.log('Getting gallery images for project ID ' + projectId);

    this.galleryDataSubscription = this.firestore
      .collection('projects')
      .doc(projectId)
      .collection('gallery')
      .snapshotChanges()
      .pipe(
        map((snapshots) => {
          return snapshots.map((snapshot) => {
            return snapshot.payload.doc.data() as GalleryData;
          });
        }),
        switchMap((galleryItems) => {
          return combineLatest(
            galleryItems.map((obj) => {
              return this.storage
                .ref(obj.storagePath)
                .getDownloadURL()
                .pipe(
                  map((imageUrl) => {
                    return {
                      ...obj,
                      imageUrl: imageUrl,
                      projectId: obj.projectId,
                    } as ExtendedGalleryData;
                  })
                );
            })
          );
        })
      )
      .subscribe((extendedGalleryData) => {
        this.extendedGalleryData = extendedGalleryData ?? [];
      });
  }
}
