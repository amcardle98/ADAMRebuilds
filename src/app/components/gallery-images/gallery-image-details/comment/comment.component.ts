import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GalleryComment } from 'app/models/car-projects';
import { User } from 'app/services/user';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnChanges {

  @Input() galleryComment?: GalleryComment;
  @Output() deleteComment: EventEmitter<void> = new EventEmitter();

  private currentPosterSubscription?: Subscription;
  posterName?: string;
  posterPhotoUrl?: string;

  currentUser: User | null;

  constructor(private readonly firestore: AngularFirestore,
    private afservice: AuthService) { }

  ngOnInit(): void {

    this.afservice.WatchCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
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

  onDeleteComment(){
    this.deleteComment.emit();
  }

}
