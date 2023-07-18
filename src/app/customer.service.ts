import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { customerdataitem } from './model/customerdataitem';

@Injectable({
  providedIn: 'root'
})

export class CustomerService {

  constructor(private httpClient: HttpClient) {}

  getCustomers(): Observable<customerdataitem[]>
  {
    return this.httpClient.get<customerdataitem[]>('/customers');
  }

}
