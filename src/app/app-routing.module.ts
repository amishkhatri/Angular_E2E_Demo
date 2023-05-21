
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PolicyListComponent }  from './policy-list/policy-list.component';
import { PolicyDetailComponent } from './policy-detail/policy-detail.component';

const routes: Routes = [
  { path: 'policies', component: PolicyListComponent },
  { path: 'policy-detail', component: PolicyDetailComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
