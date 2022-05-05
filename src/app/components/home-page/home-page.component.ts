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

  
  today = Date.parse(new Date().toISOString());
  oneWeekAgo = new Date().setDate(new Date().getDate()) - 7;
  twoWeekAgo = new Date().setDate(new Date().getDate()) - 14;

  @Output() isLogout = new EventEmitter<void>();

  constructor(
    private readonly storage: AngularFireStorage,
    private readonly fireStore: AngularFirestore,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    //Watch the entire "projects" collection for changes
    const allGalleryImages$ = this.fireStore
      .collection('projects')
      .snapshotChanges() //This is an observable that we can pipe into a bunch of transformation functions below
      .pipe(
        //When this component gets destroyed, unsubscribe from the collection
        untilDestroyed(this),

        //Get the data of each project in the collection
        map((actions) => {
          return actions.map((action) => {
            return {
              id: action.payload.doc.id,
              ...(action.payload.doc.data() as Partial<CarProject>),
            };
            //return as Partial because data could be malformed
          });
        }),

        //Map the projects to a list of projects who definitely have the galleryImages
        map((projects) => {
          return projects.filter(
            (
              project
            ): project is Partial<CarProject> & {
              id: string;
              galleryImages: GalleryData[];
            } => {
              return !!project.galleryImages;
            }
          );
        }),

        //Map the projects to a list of `GalleryData` arrays, and merge them all
        map((projects) => {
          return (
            projects
              //This creates an array of arrays. Each inner array is a project's galleryImages
              .map((project) => {
                return project.galleryImages.map((galleryItem) => {
                  return {
                    fromProjectId: project.id,
                    galleryItem: galleryItem,
                  };
                });
              })
              //Merge all the arrays together
              .reduce((acc, curr) => {
                return acc.concat(curr);
              }, [])
              //Only keep the galleryImages that have a date uploaded property.
              .filter((mashedData) => {
                return (
                  !!mashedData.galleryItem.dateUploaded &&
                  Date.parse(mashedData.galleryItem.dateUploaded) !== NaN &&
                  Date.parse(mashedData.galleryItem.dateUploaded) < Date.parse(new Date().toISOString())
                );
              })

              //Sort the gallery images by date uploaded
              .sort((a, b) => {
                return Date.parse(a.galleryItem.dateUploaded!) >
                  Date.parse(b.galleryItem.dateUploaded!)
                  ? -1
                  : 1;
              })
          );
        }),

        //Map the list of all gallery images to the web-url of the image
        switchMap((galleryImages) => {
          //Combine the latest emission of all of the observables passed in
          return combineLatest(
            //Map all the gallery images to an observable that will emit the object we want
            galleryImages.map((galleryImage) => {
              return this.storage
                .ref(galleryImage.galleryItem.storagePath)
                .getDownloadURL()
                .pipe(
                  map((url) => {
                    return {
                      imageUrl: url as string,
                      fromProjectId: galleryImage.fromProjectId,
                      caption: galleryImage.galleryItem.caption,
                      dateUploaded: galleryImage.galleryItem.dateUploaded,
                    } as GalleryViewModel;
                  }),
                  finalize(() => {
                    console.log('finalized inner storage observable');
                  })
                );
            })
          );
        }),

        finalize(() => {
          console.log('finalized gallery observable');
        }),
      )
      
        
    this.thisWeekGalleryImages$ = allGalleryImages$.pipe(
      map((galleryImages) => {
        return galleryImages.filter((item) => {
          
          if (!item.dateUploaded) {
            return false;
          }

          return new Date(Date.parse(item.dateUploaded)).getDate() > (new Date().getDate() - this.oneWeekAgo);
        });
      })
    );

    this.lastWeekGalleryImages$ = allGalleryImages$.pipe(
      map((galleryImages) => {
        return galleryImages.filter((item) => {
          
          if (!item.dateUploaded) {
            return false;
          }

          return ( (new Date(Date.parse(item.dateUploaded)).getDate() >= (new Date().getDate()) - this.twoWeekAgo) 
              && 
                  (new Date(Date.parse(item.dateUploaded)).getDate() <= (new Date().getDate() - this.oneWeekAgo))
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
}
