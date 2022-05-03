import { Component, OnInit, Input, NgModule, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { UploadTaskSnapshot } from '@angular/fire/compat/storage/interfaces';
import { Firestore, serverTimestamp } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CarProject } from 'app/models/car-projects';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { throws } from 'assert';
import { delay, firstValueFrom, map, switchMap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss'],
})
export class ProjectPageComponent implements OnInit {
  closeResult = '';
  path: String;

  descText = new FormControl(null);
  updatedText = new FormControl(null);
  compText = new FormControl(null);

  projectID: string;
  currentUser: User | null;
  canClick: boolean = false;
  project: Partial<CarProject> | null;
  progress = 0;
  isAddFileVisible = true;
  isButtonVisible = false;
  isUploading = false;

  timer: ReturnType<typeof setTimeout> = setTimeout(() => '', 5000);

  constructor(
    private storage: AngularFireStorage,
    private modalService: NgbModal,
    private fireStore: AngularFirestore,
    private route: ActivatedRoute,
    private afs: AuthService
  ) {}

  @Input() title: string | undefined;

  ngOnInit() {
    //Watch the route parameters in the address bar
    this.route.data
      .pipe(
        //Stops a memory leak by unsubscribing when the component is destroyed.
        untilDestroyed(this),

        //Map our route data to a project ID.
        map((data) => {
          return (data['projectId'] as string) ?? null;
        }),

        //Map the project ID to a real-time update stream of the project document
        switchMap((projectId) => {
          this.projectID = projectId;
          return this.fireStore
            .collection('projects')
            .doc(projectId)
            .snapshotChanges() //Snapshot changes means we will get a snapshot of the document every time it changes.
            .pipe(untilDestroyed(this));
        }),

        //Map the snapshot to a car-project object
        map((documentSnapshot) => {
          return documentSnapshot.payload.data() as
            | Partial<CarProject>
            | undefined;
        })
      )
      .subscribe((project) => {
        this.project = project ?? {};

        //Make a default project if there is no project data
        this.project.title = this.project?.title ?? 'Project';
        this.project.completed = this.project?.completed ?? [];
        this.project.description = this.project?.description ?? 'A car project';
        this.project.galleryImages = this.project?.galleryImages ?? [];
        this.project.ownerName = this.project?.ownerName ?? 'Project Owner';
        this.project.updates = this.project?.updates ?? [];

        //Populate the form fields
        this.descText.setValue(this.project?.description ?? null);
        this.updatedText.setValue(this.project?.updates ?? null);
        this.compText.setValue(this.project?.completed ?? null);
      });

    this.afs
      .WatchCurrentUser()
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
        this.canClick =
          (this.currentUser?.roles.author || this.currentUser?.roles.admin) ??
          false;
        console.log(this.currentUser?.roles);
      });
  }

  /**
   * Sets up the upload
   * @param $event
   */
  onChooseFile($event: Event) {
    console.log($event);

    if ($event.target instanceof HTMLInputElement && $event.target.files) {
      const possibleFile = $event.target.files[0];

      if (!possibleFile) {
        return;
      }

      this.path = possibleFile.name;

      this.isAddFileVisible = false;
      this.isButtonVisible = true;
    }
  }

  /**
   * Async function that uploads a file to firebase storage and adds it to the project's gallery records
   */
  async uploadImage() {
    if (!this.project) {
      //TODO show user an error? How did we get here?
      return;
    }

    //If gallery images property doesn't exist, set it to an empty array.
    this.project.galleryImages = this.project.galleryImages ?? [];

    //Before uploading, set the isUploading flag to true and hide the "upload" button.
    this.isButtonVisible = false;
    this.isUploading = true;

    let resultPath: UploadTaskSnapshot | null = null;
    try {
      //Await the upload of the file to firebase storage.
      resultPath = await this.storage.upload(
        '/images/' + this.projectID + '/' + this.project?.galleryImages?.length,
        this.path
      );
    } catch (error) {
      console.log(error);
    }

    if (resultPath) {
      //Update our local copy of the project's gallery images with the new image.
      this.project.galleryImages.push({
        storagePath: resultPath.ref.fullPath,
        postId: '',
        dateUploaded: new Date().toISOString(),
      });

      try {
        //Update the project's gallery images in firebase.
        await this.fireStore
          .collection('projects')
          .doc(this.projectID)
          .update(this.project);
      } catch (error) {
        console.log(error);
      }
    }

    //Reset the isUploading flag and show the chose file button
    this.isUploading = false;
    this.isButtonVisible = false;
    this.isAddFileVisible = true;
  }

  open(content) {
    if (!this.currentUser?.roles.admin && !this.currentUser?.roles.author) {
      return;
    }

    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          console.log(reason);
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  saveClick() {
    if (this.project) {
      this.project.description = this.descText.value;
      this.project.completed = this.compText.value;
      this.project.updates = this.updatedText.value;
      const docRef = this.fireStore
        .collection('projects')
        .doc(this.projectID)
        .set(this.project);
    }
  }

  reset() {
    this.isUploading = false;
    this.isButtonVisible = false;
    this.isAddFileVisible = true;
  }
}
