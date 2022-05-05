import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExtendedGalleryData } from '../gallery-images.component';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  GalleryComment,
  GalleryData,
  CarProject,
} from 'app/models/car-projects';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import {
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { arrayUnion } from '@angular/fire/firestore';

@UntilDestroy()
@Component({
  selector: 'app-gallery-image-details',
  templateUrl: './gallery-image-details.component.html',
  styleUrls: ['./gallery-image-details.component.scss'],
})
export class GalleryImageDetailsComponent implements OnInit {
  commentControl = new FormControl(null);
  currentUser: User | null;

  galleryData?: ExtendedGalleryData;

  constructor(
    private readonly dialogRef: MatDialogRef<GalleryImageDetailsComponent>,
    @Inject(MAT_DIALOG_DATA)
    private readonly data: ExtendedGalleryData | undefined,
    private readonly firestore: AngularFirestore,
    private readonly storage: AngularFireStorage,
    private readonly authService: AuthService
  ) {
    this.galleryData = data;

    if (this.galleryData) {
      if (this.galleryData && !this.galleryData.dateUploaded) {
        this.galleryData.dateUploaded = new Date().toISOString();
      }

      this.watchGalleryItem(this.galleryData.projectId, this.galleryData.id);
    }
  }

  ngOnInit(): void {
    this.authService.WatchCurrentUser().subscribe((currentUser) => {
      this.currentUser = currentUser;
    });

    console.log(this.galleryData);
  }

  watchGalleryItem(projectId: string, galleryItemId: string) {
    this.firestore
      .collection('projects')
      .doc(projectId)
      .collection('gallery')
      .doc(galleryItemId)
      .snapshotChanges()
      .pipe(
        untilDestroyed(this),
        map((snapshot) => {
          return snapshot.payload.data() as GalleryData | undefined;
        }),
        switchMap((galleryData) => {
          if (!galleryData) {
            return of(undefined);
          }

          return this.storage
            .ref(galleryData.storagePath)
            .getDownloadURL()
            .pipe(
              map((imageUrl) => {
                return {
                  ...galleryData,
                  imageUrl: imageUrl,
                  projectId: galleryData.projectId,
                } as ExtendedGalleryData;
              })
            );
        })
      )
      .subscribe((extendedGalleryData) => {
        console.log('Updated gallery data.');
        console.log(extendedGalleryData);
        this.galleryData = extendedGalleryData;

        if (!this.galleryData) {
          this.dialogRef.close();
        }
      });
  }

  async addComment() {
    console.log('Adding comment...');

    this.commentControl.markAllAsTouched();

    if (!this.commentControl.valid) {
      return;
    }

    if (!this.galleryData) {
      return;
    }

    if (!this.currentUser) {
      return;
    }

    this.commentControl.disable();

    const newComment: GalleryComment = {
      content: this.commentControl.value,
      timePosted: new Date().toISOString(),
      userUid: this.currentUser.uid,
    };

    const updateData = {
      comments: arrayUnion(newComment) as any,
    } as Partial<GalleryData>;

    console.log(updateData);

    await this.firestore
      .collection('projects')
      .doc(this.galleryData.projectId)
      .collection('gallery')
      .doc(this.galleryData.id)
      .ref.update(updateData);

    console.log('Added comment.');

    this.commentControl.enable();
    this.commentControl.reset();
  }
}
