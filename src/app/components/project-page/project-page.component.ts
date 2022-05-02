import { Component, OnInit, Input, NgModule, Injectable} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Firestore, serverTimestamp } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CarProject } from 'app/models/car-projects';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { throws } from 'assert';
import { delay, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements OnInit {
  closeResult = '';
  path:String;
  descText = new FormControl(null);
  updatedText = new FormControl(null);
  compText = new FormControl(null);
  projectID: string;
  currentUser: User | null;
  canClick: boolean = false;
  project: CarProject | null;
  progress = 0;
  isAddFileVisible = true;
  isButtonVisible = false;
  isUploading = false;
  
  timer: ReturnType<typeof setTimeout> = setTimeout(() => '', 5000);

  constructor(private storage: AngularFireStorage, 
    private modalService: NgbModal,
    private fireStore: AngularFirestore,
    private route: ActivatedRoute,
    private afs: AuthService) { }

  @Input() title: string | undefined;

  ngOnInit() {

    this.route.data.subscribe(async data => {
      this.projectID = data['projectId'];
      const documentSnapshot = await firstValueFrom(this.fireStore.collection('projects').doc(this.projectID).get());
      this.project = documentSnapshot.data() as CarProject ?? {};

      this.project.title = this.project?.title ?? "Project";
      this.project.completed = this.project?.completed ?? [];
      this.project.description = this.project?.description ?? "A car project";
      this.project.galleryImages = this.project?.galleryImages ?? [];
      this.project.ownerName = this.project?.ownerName ?? "Project Owner";
      this.project.updates = this.project?.updates ?? [];
    });

    this.afs.WatchCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.canClick = (this.currentUser?.roles.author || this.currentUser?.roles.admin) ?? false;
      console.log(this.currentUser?.roles);
    })
  }

  upload($event) {
    this.path = $event.target.files[0];
    this.isAddFileVisible = false;
    this.isButtonVisible = true;
  }

  uploadImage(){
    this.isButtonVisible = false;
    this.isUploading = true;
    const result = this.storage.upload("/images/"+this.projectID+"/"+ this.project?.galleryImages.length, this.path);
    result.then(x => {
      this.project?.galleryImages.push({
        storagePath: x.ref.fullPath,
        postId: "",
        dateUploaded: new Date().toISOString(),
      });
      
      if(this.project) {
        this.fireStore.collection("projects").doc(this.projectID).update(this.project);
      }
    })

    setTimeout(() => {
      this.isUploading = false;
      this.isButtonVisible = false;
      this.isAddFileVisible = true;
      location.reload();
    }, 5000);
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      console.log(reason);
    });
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

  saveClick(){
    if(this.project) {
      this.project.description = this.descText.value;
      this.project.completed = this.compText.value;
      this.project.updates = this.updatedText.value;
      const docRef = this.fireStore.collection("projects").doc(this.projectID).set(this.project);
    }

  }

  reset() {
    this.isUploading = false;
    this.isButtonVisible = false;
    this.isAddFileVisible = true;
  }
}
