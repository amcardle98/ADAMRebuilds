import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Discussion } from 'app/models/discussion';
import { Post } from 'app/models/post';
import { Observable, switchMap, map, shareReplay } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.scss'],
})
export class DiscussionComponent implements OnInit {
  currentDiscussion?: Discussion;

  posts$?: Observable<Post[]>;

  constructor(private route: ActivatedRoute, private afs: AngularFirestore) {}

  ngOnInit(): void {
    this.posts$ = this.route.params.pipe(
      untilDestroyed(this),
      switchMap((params) => {
        const discussionId = params['formCat'];
        console.log('Looking for discussion ' + discussionId);
        return this.afs
          .collection('discussions')
          .doc(discussionId)
          .collection('posts')
          .get();
      }),
      map((postsSnapshot) => {
        return postsSnapshot.docs.map((snap) => {
          return snap.data() as Post;
        });
      }),
      shareReplay(1)
    );
  }
}
