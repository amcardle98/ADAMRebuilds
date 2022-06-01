import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Post } from 'app/models/post';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit {
  postTitle: FormControl = new FormControl();
  postBody: FormControl = new FormControl();
  currentUser: User | null;

  newPostFormGroup = new FormGroup({
    postTitle: this.postTitle,
    postBody: this.postBody
  });

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: string, private firestore: AngularFirestore, private auth: AuthService, private dialogRef: MatDialogRef<NewPostComponent>) {
  }

  ngOnInit(): void {
    this.auth
      .WatchCurrentUser()
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  async submitNewPost() {
    this.newPostFormGroup.markAsTouched();

    if (!this.newPostFormGroup.valid) {
      return;
    }

    if (!this.currentUser) {
      return;
    }

    this.newPostFormGroup.disable();

    const docRef = this.firestore
                      .collection('discussions')
                      .doc(this.dialogData)
                      .collection('posts')
                      .doc();

    const newPost: Post = {
      postId: docRef.ref.id,
      title: this.postTitle.value,
      body: this.postBody.value,
      postedByUid: this.currentUser.uid,
      postedDate: new Date().toISOString()
    };

    await docRef.set(newPost);

    this.dialogRef.close();
  }
  

}
