import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Discussion } from 'app/models/discussion';
import { Post } from 'app/models/post';
import { Response } from 'app/models/response';
import { Observable, switchMap, map, shareReplay } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { PostComponent } from '../post/post.component';
import { NewPostComponent } from '../new-post/new-post.component';
import { NewResponseComponent } from '../new-response/new-response.component';

@UntilDestroy()
@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.scss'],
})
export class DiscussionComponent implements OnInit {
  currentDiscussion?: Discussion;
  discussionId?: string;

  posts$?: Observable<Post[]>;
  responses$?: Observable<Response[]>;

  constructor(private route: ActivatedRoute, private afs: AngularFirestore, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.posts$ = this.route.params.pipe(
      untilDestroyed(this),
      switchMap((params) => {
        const discussionId = params['formCat'];
        console.log('Looking for discussion ' + discussionId);
        this.discussionId = discussionId;
        return this.afs
          .collection('discussions')
          .doc(discussionId)
          .collection('posts')
          .snapshotChanges();
      }),
      map((postsSnapshot) => {
        return postsSnapshot.map((snap) => {
          return snap.payload.doc.data() as Post;
        });
      }),
      shareReplay(1)
    );
  }

  createPost() {
    this.dialog.open(NewPostComponent, {data: this.discussionId});
  }

  openPost(postId: string){
    
  }
}
