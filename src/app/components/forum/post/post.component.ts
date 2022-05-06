import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Post } from 'app/models/post';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/services/user';
import { switchMap, map, shareReplay, combineLatest } from 'rxjs';
import { Response } from 'app/models/response';
import { FormControl, Validators } from '@angular/forms';
import { doc } from 'firebase/firestore';

@UntilDestroy()
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  currentUser: User | null;
  currentPost: Post | null;
  discussionId?: string;
  postedBy: string | undefined | null;

  responseControl = new FormControl(null, Validators.required);
  responses: Array<Response & {postedBy: User | null}> = [];

  constructor(private auth: AuthService, private afs: AngularFirestore, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.auth
      .WatchCurrentUser()
      .subscribe((user) => {
        this.currentUser = user;
      });
    
    this.route.params.pipe(
      untilDestroyed(this),
      switchMap((params) => {
        const formId = params['formCat'];
        const postId = params['postId'];
        //Get the response collection of the post in the discussion
        return this.afs
          .collection('discussions')
          .doc(formId)
          .collection('posts')
          .doc(postId)
          .collection('responses')
          .snapshotChanges()
      }),
      map((actions) => {
        return actions.map((a) => {
          const data = a.payload.doc.data() as Response;
          return data;
        });
      }),
      switchMap((responses) => {
        return combineLatest(
          responses.map((response) => {
            return this.afs
              .collection('users')
              .doc(response.postedByUid)
              .snapshotChanges()
              .pipe(
                map((user) => {
                  return {
                    ...response,
                    postedBy: user.payload.data() as User | null
                  };
                })
              );
          })
        )
      }),
      map((responses) => {
        //Sort by date posted, newest first
        return responses.sort((a, b) => {
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        });
      }),
    ).subscribe((responses) => {
      this.responses = responses ?? [];
    })

    const currentPost$ = this.route.params.pipe(
      untilDestroyed(this),
      switchMap((params) => {
        const formId = params['formCat'];
        this.discussionId = formId;
        const postId = params['postId'];
        console.log('Looking for post ' + postId);
        return this.afs
          .collection('discussions')
          .doc(formId)
          .collection('posts')
          .doc(postId)
          .snapshotChanges();
      }),
      map((postsSnapshot) => {
        return postsSnapshot.payload.data() as Post;
      }),
      shareReplay(1)
    );

    currentPost$.subscribe((post) => {
      this.currentPost = post;
    });

    currentPost$.pipe(
      switchMap((post) => {
        return this.afs
          .collection('users')
          .doc(post.postedByUid).get()
      }),
      map((userSnap) => {
        return userSnap.data() as User | null;
      })
    ).subscribe((user) => {
      this.postedBy = user?.displayName;
    });
  }

  async postResponse() {

    

    //Make sure current post isn't null!
    if(!this.currentPost){
      return;
    }


    //Make sure form control is valid!
    if(!this.responseControl.valid){
      return;
    }
    //Make sure user is logged in!
    if(!this.currentUser) {
      return;
    }

    //Make sure we have the discussion ID
    if (!this.discussionId) {
      return;
    }

    this.responseControl.disable();
    
    const docRef = this.afs
      .collection('discussions')
      .doc(this.discussionId)
      .collection('posts')
      .doc(this.currentPost.postId)
      .collection('responses')
      .doc();

    const newResponse: Response = {
      body: this.responseControl.value,
      postId: this.currentPost?.postId,
      postedByUid: this.currentUser?.uid,
      postedDate: new Date().toISOString(),
      responseId: docRef.ref.id
    };

    await docRef.set(newResponse);

    this.responseControl.reset();
    this.responseControl.enable();
  }

  deleteResponse(responseToDelete: Response) {

    //TODO: Make sure user is logged in!

  }

}
