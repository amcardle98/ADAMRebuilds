import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Discussion } from 'app/models/discussion';

@Component({
  selector: 'app-new-discussion',
  templateUrl: './new-discussion.component.html',
  styleUrls: ['./new-discussion.component.scss'],
})
export class NewDiscussionComponent implements OnInit {
  newDiscussionFormGroup = new FormGroup({
    title: new FormControl(null, Validators.required),
    description: new FormControl(null),
  });

  constructor(
    private readonly firestore: AngularFirestore,
    private readonly matDialogRef: MatDialogRef<NewDiscussionComponent>
  ) {}

  ngOnInit(): void {}

  async submitNewForm() {
    this.newDiscussionFormGroup.markAsTouched();

    if (!this.newDiscussionFormGroup.valid) {
      return;
    }

    this.newDiscussionFormGroup.disable();

    const docRef = this.firestore.collection('discussions').doc();

    docRef.ref.id;

    const newDiscussion: Discussion = {
      description: this.newDiscussionFormGroup.value.description,
      title: this.newDiscussionFormGroup.value.title,
      id: docRef.ref.id,
    };

    await docRef.set(newDiscussion);

    this.matDialogRef.close();
  }
}
