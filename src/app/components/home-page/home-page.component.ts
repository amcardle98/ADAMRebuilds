import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { CarProject, GalleryData } from 'app/models/car-projects';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GalleryItemDetailComponent } from './gallery-item-detail/gallery-item-detail.component';
import { MatDialog } from '@angular/material/dialog';

export interface GalleryViewModel {
  fromProjectId: string;
  imageUrl: string;
  caption?: string;
  dateUploaded?: string;
}

@UntilDestroy()
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  thisWeekGalleryImages$: Observable<GalleryViewModel[]>;
  lastWeekGalleryImages$: Observable<GalleryViewModel[]>;

  today = new Date();
  oneWeekAgo = new Date();
  twoWeekAgo = new Date();

  // setDate(new Date().getDate() - 7);
  // setDate(new Date().getDate() - 14);

  @Output() isLogout = new EventEmitter<void>();

  constructor(
    private readonly storage: AngularFireStorage,
    private readonly fireStore: AngularFirestore,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.oneWeekAgo.setDate(this.oneWeekAgo.getDate() - 7);
    this.twoWeekAgo.setDate(this.oneWeekAgo.getDate() - 14);
    //Watch the entire "projects" collection for changes
    const allGalleryImages$ = this.fireStore
      .collection('projects')
      .snapshotChanges() //This is an observable that we can pipe into a bunch of transformation functions below
      .pipe(
        //When this component gets destroyed, unsubscribe from the collection
        untilDestroyed(this),

        //Get the data of each project in the collection
        switchMap((actions) => {
          return combineLatest(
            actions.map((action) => {
              return this.fireStore
                .collection('projects')
                .doc(action.payload.doc.id)
                .collection('gallery')
                .snapshotChanges();
            })
          );
        }),

        map((galleryActions) => {
          return galleryActions.reduce((acc, galleryActions) => {
            return acc.concat(galleryActions);
          }, []);
        }),

        map((galleryActions) => {
          return galleryActions.map((galleryAction) => {
            return galleryAction.payload.doc.data() as GalleryData;
          });
        }),

        switchMap((galleryItems) => {
          //Map to image URLs
          return combineLatest(
            galleryItems.map((galleryItem) => {
              return this.storage
                .ref(galleryItem.storagePath)
                .getDownloadURL()
                .pipe(
                  map((url) => {
                    return {
                      galleryItem: galleryItem,
                      imageUrl: url,
                    };
                  })
                );
            })
          );
        }),

        map((expandedGalleryItems) => {
          return expandedGalleryItems.map((expanded) => {
            return {
              fromProjectId: expanded.galleryItem.projectId,
              imageUrl: expanded.imageUrl,
              caption: expanded.galleryItem.caption,
              dateUploaded: expanded.galleryItem.dateUploaded,
            } as GalleryViewModel;
          });
        }),

        finalize(() => {
          console.log('finalized gallery observable');
        })
      );

    this.thisWeekGalleryImages$ = allGalleryImages$.pipe(
      map((galleryImages) => {
        return galleryImages
          .filter(
            (item): item is GalleryViewModel & { dateUploaded: string } => {
              if (!item.dateUploaded) {
                return false;
              }

              return (
                this.dateDifference(
                  this.today,
                  new Date(Date.parse(item.dateUploaded))
                ) < 7
              );
            }
          )
          .sort((a, b) => {
            return (
              new Date(Date.parse(b.dateUploaded)).getTime() -
              new Date(Date.parse(a.dateUploaded)).getTime()
            );
          });
      })
    );

    this.lastWeekGalleryImages$ = allGalleryImages$.pipe(
      map((galleryImages) => {
        return galleryImages
          .filter(
            (item): item is GalleryViewModel & { dateUploaded: string } => {
              if (!item.dateUploaded) {
                return false;
              }

              console.log(
                this.dateDifference(
                  this.today,
                  new Date(Date.parse(item.dateUploaded))
                ) >= 7
              );
              return (
                // new Date(Date.parse(item.dateUploaded)).getDate() >=
                //   new Date().getDate() - this.twoWeekAgo &&
                this.dateDifference(
                  this.today,
                  new Date(Date.parse(item.dateUploaded))
                ) >= 7 &&
                this.dateDifference(
                  this.today,
                  new Date(Date.parse(item.dateUploaded))
                ) < 14
              );
            }
          )
          .sort((a, b) => {
            return (
              new Date(Date.parse(b.dateUploaded)).getTime() -
              new Date(Date.parse(a.dateUploaded)).getTime()
            );
          });
      })
    );

    // console.log(this.project);
  }

  openGalleryDetail(item: GalleryViewModel) {
    this.dialog.open(GalleryItemDetailComponent, {
      data: item,
    });
  }

  dateDifference(date2: Date, date1: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Discard the time and time-zone information.
    const utc1 = Date.UTC(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate()
    );
    const utc2 = Date.UTC(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate()
    );

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }
}
