import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CarProject, GalleryData } from 'app/models/car-projects';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { combineLatest, map, of, switchMap } from 'rxjs';

type ExtendedCarProject = CarProject & {
  latestPictureUrl?: string;
  id: string;
};

@UntilDestroy()
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  projects: ExtendedCarProject[] = [];
  firstLoad = true;

  currentUser: User | null;
  get currentUserIsAdmin(): boolean {
    return this.currentUser?.roles.admin ?? false;
  }

  constructor(
    private readonly firestore: AngularFirestore,
    private readonly storeage: AngularFireStorage,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.firestore
      .collection('projects')
      .snapshotChanges()
      .pipe(
        untilDestroyed(this),
        map((actions) => {
          return actions.map((action) => {
            const data = action.payload.doc.data() as CarProject;
            const id = action.payload.doc.id;
            return { id, ...data };
          });
        }),
        switchMap((projects) => {
          return combineLatest(
            projects.map((project) => {
              return this.firestore
                .collection(`projects/${project.id}/gallery`)
                .snapshotChanges()
                .pipe(
                  untilDestroyed(this),
                  map((actions) => {
                    return actions
                      .map((action) => {
                        return action.payload.doc.data() as GalleryData;
                      })
                      .sort((a, b) => {
                        //Sort by date uploaded, newest first
                        return (
                          new Date(b.dateUploaded).getTime() -
                          new Date(a.dateUploaded).getTime()
                        );
                      });
                  }),
                  switchMap((gallery) => {
                    if (gallery.length < 1) {
                      return of(undefined);
                    }

                    return this.storeage
                      .ref(gallery[0].storagePath)
                      .getDownloadURL()
                      .pipe(untilDestroyed(this));
                  }),
                  map((url) => {
                    return { ...project, latestPictureUrl: url };
                  })
                );
            })
          );
        })
      )
      .subscribe((projectsWithLatestPicture) => {
        this.projects = projectsWithLatestPicture;
        this.firstLoad = false;
      });

    this.authService
      .WatchCurrentUser()
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }
}
