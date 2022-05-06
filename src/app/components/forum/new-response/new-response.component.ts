import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';

@Component({
  selector: 'app-new-response',
  templateUrl: './new-response.component.html',
  styleUrls: ['./new-response.component.scss']
})
export class NewResponseComponent implements OnInit {

  newResponseFormGroup = new FormGroup({

  })
  currentUser: User | null;

  constructor(private auth: AuthService, private afs: AngularFirestore) { }

  ngOnInit(): void {
    this.auth
    .WatchCurrentUser()
    .subscribe((user) => {
      this.currentUser = user;
    });
  }

  async submitNewResponse() {
    this.newResponseFormGroup.markAsTouched();

    if (!this.newResponseFormGroup.valid) {
      return;
    }

    if (!this.currentUser) {
      return;
    }

    // const docRef = this.afs
    //                   .collection('discussions')
    //                   .doc(this.dialogData)
    //                   .collection('posts')
    //                   .doc();

    // const newPost: Post = {
    //   postId: docRef.ref.id,
    //   title: this.postTitle.value,
    //   body: this.postBody.value,
    //   postedByUid: this.currentUser.uid,
    //   postedDate: new Date().toISOString()
    // };

    // await docRef.set(newPost);

    // this.dialogRef.close();
  }

}
