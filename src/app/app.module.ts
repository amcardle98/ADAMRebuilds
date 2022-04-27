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
import { Rx8PageComponent } from './pages/rx8-page/rx8-page.component';
import { BmwPageComponent } from './pages/bmw-page/bmw-page.component';
import { LegacyPageComponent } from './pages/legacy-page/legacy-page.component';
import { AmgPageComponent } from './pages/amg-page/amg-page.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore';
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
import { User } from './services/user';



@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ProjectPageComponent,
    LoginPageComponent,
    NavbarComponent,
    NavbarButtonComponent,
    Rx8PageComponent,
    BmwPageComponent,
    LegacyPageComponent,
    AmgPageComponent,
    ForumComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    DropZoneDirective,
    FileUploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    AngularFirestoreModule,
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [AuthService, AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule { }
