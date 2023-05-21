import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientInMemoryWebApiModule, InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { PolicyListComponent } from './policy-list/policy-list.component';
import { PolicyService } from './policy.service';
import { HttpClientModule }    from '@angular/common/http';
import { PolicyDetailComponent } from './policy-detail/policy-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    PolicyListComponent,
    PolicyDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(DataService)
  ],
  providers: [PolicyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
