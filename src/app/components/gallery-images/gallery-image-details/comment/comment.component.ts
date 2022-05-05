import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { GalleryComment } from 'app/models/car-projects';
import { User } from 'app/services/user';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnChanges {

  @Input() galleryComment?: GalleryComment;

  private currentPosterSubscription?: Subscription;
  posterName?: string;
  posterPhotoUrl?: string;

  constructor(private readonly firestore: AngularFirestore) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['galleryComment']) {
      this.galleryComment = changes['galleryComment'].currentValue;
      this.lookupCommentDetails();
    }

  }

  private async lookupCommentDetails() {

    this.currentPosterSubscription?.unsubscribe();

    if (!this.galleryComment) {
      this.posterName = undefined;
      this.posterPhotoUrl = undefined;
      return;
    }

    this.currentPosterSubscription = this.firestore.collection('users').doc(this.galleryComment.userUid).snapshotChanges().pipe(untilDestroyed(this)).subscribe((snapshot) => {
      this.posterName = (snapshot.payload.data() as any).displayName;
      this.posterPhotoUrl = (snapshot.payload.data() as any).photoURL;
    });
    
  }

}
