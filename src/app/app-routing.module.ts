
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PolicyListComponent }  from './policy-list/policy-list.component';

const routes: Routes = [
  { path: 'policies', component: PolicyListComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
