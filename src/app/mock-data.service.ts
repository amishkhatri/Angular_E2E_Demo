import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api'
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService implements InMemoryDbService{

  constructor() { }
  
  createDb(){

    let  policies =  [
      {  id:  111,  num:  'PO1', amount: 512.99, userId: 14521, clientId: 45, description: 'Life Insurance - Term Plan' },
      {  id:  112,  num:  'PO2', amount: 718.87, userId: 14588, clientId: 87, description: 'Personal Care - Accedential Death' },
      {  id:  113,  num:  'PO3', amount: 129.65, userId: 10213, clientId: 98, description: 'Home Loan - Secure' },
      {  id:  114,  num:  'PO4', amount: 302.19, userId: 11968, clientId: 33, description: 'Travel - Insurance ' }
     ];
   
   return {policies};

  }
}
