import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { DonorListComponent } from './components/donor-list/donor-list.component';
import { EditDonorComponent } from './components/edit-donor/edit-donor.component';
import { SuperAdminAuthGuard } from './shared/guard/super-admin.guard';
import { UserListComponent } from './components/user-list/user-list.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { AdminAuthGuard } from './shared/guard/admin.guard';
import { RequestListComponent } from './components/request-list/request-list.component';
import { DataResolver } from './shared/guard/data-resolver';

const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  {
    path: 'home/:id',
    component: HomeComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: DataResolver
    },
    children: [
      { path: 'add', component: EditDonorComponent },
      { path: 'edit/:id', component: EditDonorComponent },
      { path: 'users/:id', component: EditUserComponent },
      { path: 'list', component: DonorListComponent },
      {
        path: 'users',
        component: UserListComponent,
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'requests',
        component: RequestListComponent,
        canActivate: [AdminAuthGuard],
      },
      { path: '', component: DonorListComponent, pathMatch: 'full' },
    ],
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
