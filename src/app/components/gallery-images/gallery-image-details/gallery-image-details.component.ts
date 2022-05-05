import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { ExtendedGalleryData } from '../gallery-images.component';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { GalleryComment, GalleryData, CarProject } from 'app/models/car-projects';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { combineLatest, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-gallery-image-details',
  templateUrl: './gallery-image-details.component.html',
  styleUrls: ['./gallery-image-details.component.scss']
})
export class GalleryImageDetailsComponent implements OnInit {

  commentControl = new FormControl(null);
  currentUser: User | null;

  galleryData?: ExtendedGalleryData

  constructor(
    private readonly dialogRef: MatDialogRef<GalleryImageDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: ExtendedGalleryData | undefined, 
    private readonly firestore: AngularFirestore,
    private readonly storage: AngularFireStorage,
    private readonly authService: AuthService,
  ) {
    this.galleryData = data;

    if(data && data.dateUploaded) {
      this.watchGalleryItem(data.projectId, data.dateUploaded)
    }
  }

  ngOnInit(): void {
    this.authService.WatchCurrentUser().subscribe((currentUser) => {
      this.currentUser = currentUser;
    })

    console.log(this.galleryData);
  }

  watchGalleryItem(projectId: string, dateUploaded: string) {
    this.firestore.collection('projects').doc(projectId).snapshotChanges().pipe(
      untilDestroyed(this),
      map((snapshot) => {
        return {
          id: projectId,
          project: snapshot.payload.data() as CarProject | undefined,
        }
      }),
      switchMap((projectData) => {
        if(!projectData.project) {
          return of(undefined)
        }

        const thisGalleryItemIndex = projectData.project.galleryImages.findIndex((gd) => {

          if (!gd.dateUploaded) {
            return false;
          }

          if (!this.galleryData?.dateUploaded) {
            return false;
          }

          return gd.dateUploaded === this.galleryData?.dateUploaded
        })

        if (thisGalleryItemIndex < 0) {
          return of(undefined);
        }

        const thisGalleryItem = projectData.project.galleryImages[thisGalleryItemIndex];

        return this.storage
          .ref(thisGalleryItem.storagePath)
          .getDownloadURL().pipe(
            map((imageUrl) => {
              return {
                ...thisGalleryItem,
                imageUrl: imageUrl,
                projectId: projectData.id,
                arrayIndex: thisGalleryItemIndex,
              } as ExtendedGalleryData;
            })
          );

      })
    ).subscribe((extendedGalleryData) => {
      this.galleryData = extendedGalleryData;

      if (!this.galleryData) {
        this.dialogRef.close();
      }

    })
  }

  async addComment() {
    
    console.log("Adding comment...");

    this.commentControl.markAllAsTouched();

    if (!this.commentControl.valid) {
      return;
    }

    if(!this.galleryData) {
      return;
    }

    if(!this.currentUser) {
      return;
    }

    this.commentControl.disable();

    const newGalleryItem: GalleryData = {
      storagePath: this.galleryData?.storagePath,
      postId: this.galleryData?.postId,
      caption: this.galleryData?.caption,
      comments: this.galleryData?.comments ?? []
    };

    for (const key in newGalleryItem) {
      if (Object.prototype.hasOwnProperty.call(newGalleryItem, key)) {
        const element = newGalleryItem[key];
        if (element === undefined) {
          delete newGalleryItem[key];
        }

      }
    }

    const newComment: GalleryComment = {
      content: this.commentControl.value,
      timePosted: new Date().toISOString(),
      userUid: this.currentUser.uid,
    }

    newGalleryItem.comments = (newGalleryItem.comments ?? []).concat(newComment);

    const existingProjectSnap = await firstValueFrom(this.firestore.collection('projects').doc(this.galleryData.projectId).get())
    const existingProject = existingProjectSnap.data() as CarProject | undefined;

    if (!existingProject) {
      this.commentControl.enable();
      return;
    }

    existingProject.galleryImages[this.galleryData.arrayIndex] = newGalleryItem;

    const updateData = {
      galleryImages: existingProject.galleryImages
    } as Partial<CarProject>;

    console.log(updateData);

    await existingProjectSnap.ref.update(updateData);

    console.log("Added comment.");

    this.commentControl.enable();
    this.commentControl.reset();

  }

}
