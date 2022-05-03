import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { CarProject, GalleryData } from 'app/models/car-projects';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  downloadURL: Observable<string>;
  public readonly downloadUrl$: Observable<string>;
  photos: string[];
  projectID: string;
  updated: string;
  project: CarProject = {
    completed: [],
    description: '',
    galleryImages: [],
    ownerName: 'test',
    updates: [],
    title: 'project',
  };

  projectGalleryImageUrls: {
    imageUrl: string;
    route: string;
  }[] = [];

  @Output() isLogout = new EventEmitter<void>();

  constructor(
    private storage: AngularFireStorage,
    private fireStore: AngularFirestore,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //Watch the entire "projects" collection for changes
    this.fireStore
      .collection('projects')
      .snapshotChanges() //This is an observable that we can pipe into a bunch of transformation functions below
      .pipe(
        //When this component gets destroyed, unsubscribe from the collection
        untilDestroyed(this),

        //Get the data of each project in the collection
        map((actions) => {
          return actions.map((action) => {
            return action.payload.doc.data() as Partial<CarProject>;
            //return as Partial because data could be malformed
          });
        }),

        //Map the projects to a list of projects who definitely have the galleryImages
        map((projects) => {
          return projects.filter(
            (
              project
            ): project is Partial<CarProject> & {
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
                return project.galleryImages;
              })
              //Merge all the arrays together
              .reduce((acc, curr) => {
                return acc.concat(curr);
              }, [])
              //Only keep the galleryImages that have a date uploaded property.
              .filter(
                (
                  gallery
                ): gallery is GalleryData & { dateUploaded: string } => {
                  return (
                    !!gallery.dateUploaded &&
                    Date.parse(gallery.dateUploaded) !== NaN
                  );
                }
              )

              //Sort the gallery images by date uploaded
              .sort((a, b) => {
                return Date.parse(a.dateUploaded) > Date.parse(b.dateUploaded)
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
                .ref(galleryImage.storagePath)
                .getDownloadURL()
                .pipe(
                  map((url) => {
                    return {
                      imageUrl: url as string,
                      route: galleryImage.postId,
                    };
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
        })
      )
      .subscribe((galleryImageUrls) => {
        this.projectGalleryImageUrls = galleryImageUrls;
      });

    // console.log(this.project);
  }

  updatedPage() {
    this.updated = new Date().toLocaleString();
  }
}
