import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { AmgPageComponent } from './pages/amg-page/amg-page.component';
import { BmwPageComponent } from './pages/bmw-page/bmw-page.component';
import { LegacyPageComponent } from './pages/legacy-page/legacy-page.component';
import { Rx8PageComponent } from './pages/rx8-page/rx8-page.component';
import { ForumComponent } from './components/forum/forum.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { AuthGuard } from './shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard]},
  { path: 'rx8', component:  Rx8PageComponent, canActivate: [AuthGuard]},
  { path: 'bmw', component: BmwPageComponent, canActivate: [AuthGuard] },
  { path: 'legacy', component: LegacyPageComponent, canActivate: [AuthGuard] },
  { path: 'amg', component: AmgPageComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'forum', component: ForumComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
