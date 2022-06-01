import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Discussion } from 'app/models/discussion';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { combineLatest, map, switchMap } from 'rxjs';
import { NewDiscussionComponent } from './new-discussion/new-discussion.component';

interface DiscussionData {
  discussion: Discussion;
  posts: number;
  views?: number;
}

@UntilDestroy()
@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss'],
})
export class ForumComponent implements OnInit {
  currentUser: User | null;

  loadingFirst = true;
  discussions: DiscussionData[] = [];

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private dialogService: MatDialog
  ) {}

  async ngOnInit() {
    this.afs
      .collection('discussions')
      .snapshotChanges()
      .pipe(
        untilDestroyed(this),
        map((actions) => {
          return actions
            .map((a) => {
              return a.payload.doc.data() as Discussion | undefined;
            })
            .filter((d): d is Discussion => d !== undefined);
        }),
        switchMap((discussions) => {
          return combineLatest(
            discussions.map((d) => {
              return this.afs
                .collection('discussions')
                .doc(d.id)
                .collection('posts')
                .valueChanges()
                .pipe(
                  untilDestroyed(this),
                  map((posts) => {
                    return {
                      discussion: d,
                      posts: posts.length,
                    };
                  })
                );
            })
          );
        })
      )
      .subscribe((discussions) => {
        this.discussions = discussions;
        this.loadingFirst = false;
      });

    this.authService
      .WatchCurrentUser()
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  async beginNewForm() {
    this.dialogService.open(NewDiscussionComponent);
  }
}
