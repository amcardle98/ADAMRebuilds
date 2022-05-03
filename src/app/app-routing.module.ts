import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { ForumComponent } from './components/forum/forum.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { ProjectPageComponent } from './components/project-page/project-page.component';
import { Auth } from '@angular/fire/auth';
import { DiscussionComponent } from './components/forum/discussion/discussion.component';
import { PostComponent } from './components/forum/post/post.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
  {
    path: 'rx8',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
    data: { projectId: 'rx8' },
  },
  {
    path: 'bmw',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
    data: { projectId: 'bmw' },
  },
  {
    path: 'legacy',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
    data: { projectId: 'legacy' },
  },
  {
    path: 'amg',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
    data: { projectId: 'amg' },
  },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignUpComponent },
  {
    path: 'forum',
    component: ForumComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'forum/:formCat',
    component: DiscussionComponent,
  },
  {
    path: 'forum/:formCat/:postId',
    component: PostComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
