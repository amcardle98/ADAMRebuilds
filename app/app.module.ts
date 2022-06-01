import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
//import { AngularFireModule } from '@angular/fire'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ProjectPageComponent } from './components/project-page/project-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavbarButtonComponent } from './widgets/navbar-button/navbar-button.component';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore, initializeFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import {
  AngularFirestore,
  AngularFirestoreModule,
} from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { ForumComponent } from './components/forum/forum.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthService } from './services/auth.service';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { DropZoneDirective } from './drop-zone.directive';
import { FileUploadComponent } from './services/file-upload/file-upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GalleryImagesComponent } from './components/gallery-images/gallery-images.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DiscussionComponent } from './components/forum/discussion/discussion.component';
import { PostComponent } from './components/forum/post/post.component';
import { NewDiscussionComponent } from './components/forum/new-discussion/new-discussion.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NewPostComponent } from './components/forum/new-post/new-post.component';
import { GalleryItemDetailComponent } from './components/home-page/gallery-item-detail/gallery-item-detail.component';
import { GalleryImageDetailsComponent } from './components/gallery-images/gallery-image-details/gallery-image-details.component';
import { CommentComponent } from './components/gallery-images/gallery-image-details/comment/comment.component';
import { getApp } from '@angular/fire/app';
import { NewResponseComponent } from './components/forum/new-response/new-response.component';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ProjectPageComponent,
    LoginPageComponent,
    NavbarComponent,
    NavbarButtonComponent,
    ForumComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    DropZoneDirective,
    FileUploadComponent,
    GalleryImagesComponent,
    DiscussionComponent,
    PostComponent,
    NewDiscussionComponent,
    NewPostComponent,
    GalleryItemDetailComponent,
    GalleryImageDetailsComponent,
    CommentComponent,
    NewResponseComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideAuth(() => getAuth()),
    provideFirestore(() => initializeFirestore(getApp(), { ignoreUndefinedProperties: true })),
    provideStorage(() => getStorage()),
    AngularFirestoreModule,
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule
  ],
  providers: [AuthService, AngularFirestore],
  bootstrap: [AppComponent],
})
export class AppModule {}
