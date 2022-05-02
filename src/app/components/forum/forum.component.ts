import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Discussion } from 'app/models/discussion';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit {

  discussions: Discussion[] = [];

  //TODO Use angular firestore to get all of the documents in the 'discussions' collection!
  constructor(private afs: AngularFirestore) { }

  async ngOnInit() {
    const snapshot = await firstValueFrom(this.afs.collection('discussions').get());

    this.discussions = snapshot.docs.map((doc) => {
      return doc.data() as Discussion;
    });
  }

}
