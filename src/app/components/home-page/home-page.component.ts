import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularFireStorage} from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, Observable, of } from 'rxjs';
import { finalize, startWith, tap } from 'rxjs/operators';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { trace } from '@angular/fire/compat/performance';
import { getStorage, ref, listAll } from 'firebase/storage';
import { CarProject } from 'app/models/car-projects';
import { ActivatedRoute } from '@angular/router';

interface Item {
  name: string
};

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  downloadURL: Observable<string>;
  public readonly downloadUrl$: Observable<string>;
  photos: string[];
  projectID: string;
  updated: string;
  project: CarProject = {
    completed: [],
    description: "",
    galleryImages: [],
    ownerName: "test",
    updates: [],
    title: "project"
  };

  projectGalleryImageUrls: {
    imageUrl: string,
    route: string,
  }[] = [];

  @Output() isLogout = new EventEmitter<void>()

  constructor(private storage: AngularFireStorage,
    private fireStore: AngularFirestore,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      this.projectID = params['PID'];
      const data = await firstValueFrom(this.fireStore.collection('projects').doc("7e5w4H0NFpQr9m4cG2oD").get());
      this.project = data.data() as CarProject;

      this.getGalleryImages(this.project);
    });

    // console.log(this.project);
  }

  async getGalleryImages(project: CarProject) {

    this.projectGalleryImageUrls = await Promise.all(
      project.galleryImages.map(async (obj) => {
        const imageURL = firstValueFrom(this.storage.ref(obj.storagePath).getDownloadURL() as Observable<string | unknown>);
  
        return {
          imageUrl: (await imageURL) as string,
          route: obj.postId,
        };
  
      })
    );
  }

  addPhoto() {

  }

  updatedPage(){
    this.updated = new Date().toLocaleString();
  }


}
