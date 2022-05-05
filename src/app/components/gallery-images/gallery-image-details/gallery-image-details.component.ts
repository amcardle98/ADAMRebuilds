import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExtendedGalleryData } from '../gallery-images.component';
import { FormControl, Validators } from '@angular/forms';
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
import { arrayRemove, arrayUnion } from '@angular/fire/firestore';

@UntilDestroy()
@Component({
  selector: 'app-gallery-image-details',
  templateUrl: './gallery-image-details.component.html',
  styleUrls: ['./gallery-image-details.component.scss'],
})
export class GalleryImageDetailsComponent implements OnInit {
  commentControl = new FormControl(null, Validators.required);
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
      .valueChanges()
      .pipe(
        untilDestroyed(this),
        map((snapshot) => {
          return snapshot as GalleryData | undefined;
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
        }),
        map((eGalleryData) => {

          if (!eGalleryData) {
            return eGalleryData;
          }

          eGalleryData.comments = eGalleryData?.comments?.sort((a, b) => {
            //sort by date posted
            const aDate = Date.parse(a.timePosted);
            const bDate = Date.parse(b.timePosted);

            return aDate - bDate;
          }).reverse();

          return eGalleryData;
          
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

  async deleteComment(index: number) {

    //TODO: Lookup the comment on the given index!
    //Then delete

    if (!this.galleryData || !this.galleryData.comments) {
      return;
    }

    //Get the comment at the given index
    const comment = this.galleryData.comments[index];

    if (!comment) {
      return;
    }

    await this.firestore
      .collection('projects')
      .doc(this.galleryData.projectId)
      .collection('gallery')
      .doc(this.galleryData.id)
      .update({
        comments: arrayRemove(comment) as any,
      });

  }

  async deleteImage() {

    console.log('Deleting photo for ' + this.galleryData?.id + ' in project ' + this.galleryData?.projectId + '...');

    if (!this.galleryData) {
      return;
    }

    if (!this.currentUser) {
      return;
    }

    //TODO: Verify current user is the one who posted this!

    const storagePath = this.galleryData.storagePath;
    
    const result = await this.firestore
      .collection('projects')
      .doc(this.galleryData.projectId)
      .collection('gallery')
      .doc(this.galleryData.id)
      .delete();

    const storageResult = await this.storage.ref(storagePath).delete();

    console.log('Deleted gallery item ' + this.galleryData?.id + ' in project ' + this.galleryData?.projectId + '.');
    console.log('Deleted storage item ' + storagePath + '.');
  }
}
