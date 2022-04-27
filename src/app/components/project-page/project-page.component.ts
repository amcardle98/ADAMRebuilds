import { Component, OnInit, Input, NgModule, Injectable} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Firestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CarProject } from 'app/models/car-projects';
import { AmgPageComponent } from 'app/pages/amg-page/amg-page.component';
import { BmwPageComponent } from 'app/pages/bmw-page/bmw-page.component';
import { LegacyPageComponent } from 'app/pages/legacy-page/legacy-page.component';
import { Rx8PageComponent } from 'app/pages/rx8-page/rx8-page.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements OnInit {
  closeResult = '';
  path:String;
  text = new FormControl(null);
  projectID: string;
  project: CarProject = {
    completed: [],
    description: "",
    galleryImages: [],
    ownerName: "test",
    updates: []
  };

  constructor(private storage: AngularFireStorage, 
    private modalService: NgbModal,
    private fireStore: AngularFirestore,
    private route: ActivatedRoute) { }

  @Input() title: string | undefined;

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.projectID = params['PID'];
      const data = await firstValueFrom(this.fireStore.collection('projects').doc("7e5w4H0NFpQr9m4cG2oD").get());
      this.project = data.data() as CarProject;
    });
  }

  upload($event) {
    this.path = $event.target.files[0];
  }

  uploadImage(){
    const result = this.storage.upload("/images/"+this.title+"/"+ "1", this.path);
    result.then(x => {
      this.project.galleryImages.push({
        imageUrl: x.ref.fullPath,
        postId: ""
      });
      
      this.fireStore.collection("projects").doc("7e5w4H0NFpQr9m4cG2oD").update(this.project);
    })
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
    this.project.description = this.text.value;
    this.fireStore.collection("projects").doc("7e5w4H0NFpQr9m4cG2oD").update(this.project);
  }
}
