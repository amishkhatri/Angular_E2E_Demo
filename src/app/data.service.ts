import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api'

@Injectable({
  providedIn: 'root'
})
export class DataService implements InMemoryDbService{

  constructor() { }
  
  createDb(){

    let  policies =  [
      {  id:  1,  num:  'PO1', amount: 512.99, userId: 14521, clientId: 45, description: 'Life Insurance - Term Plan' },
      {  id:  2,  num:  'PO2', amount: 718.87, userId: 14588, clientId: 87, description: 'Personal Care - Accedential Death' },
      {  id:  3,  num:  'PO3', amount: 129.65, userId: 10213, clientId: 98, description: 'Home Loan - Secure' },
      {  id:  4,  num:  'PO4', amount: 302.19, userId: 11968, clientId: 33, description: 'Travel - Insurance ' }
     ];
    
   return {policies};


  }
}
