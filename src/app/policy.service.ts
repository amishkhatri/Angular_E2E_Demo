import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { policydataitem } from './policydataitem'


@Injectable({
  providedIn: 'root'
})

export class PolicyService 
{

  constructor(private httpClient: HttpClient) { }
  SERVER_URL: string = 'http://localhost:8080/api/';

// GET policies from the server 
getPolicies (): Observable<policydataitem[]> {
  return this.httpClient.get<policydataitem[]>(this.SERVER_URL + 'policies')
    .pipe(
      tap(policies => this.log('fetched policies')),
      catchError(this.handleError('getpolicies1',[]))
    );
}

  // public getPolicies()
  // {
  //   return this.httpClient.get(this.SERVER_URL + 'policies')
  // }


  // public getPolicies()
  // {
  //   return this.httpClient.get<policydataitem[]>(this.SERVER_URL + 'policies')
  // }

  
 public deletePolicyById(policyId: any)
  {
    return this.httpClient.delete(`${this.SERVER_URL + 'policies'}/${policyId}`)
  }

  public getPolicyById(policyId: any)
  {
    //const url = `${this.SERVER_URL}/?policyId=${policyId}`;

    //return this.httpClient.get(url);

    return this.httpClient.get(`${this.SERVER_URL + 'policies'}/${policyId}`);

   
  }
 
public createPolicy(policy: {id: number, amount: number, clientId: number, userId: number, description: string}){
    return this.httpClient.post(`${this.SERVER_URL + 'policies'}`, policy)
}


public updatePolicy(policy: {id: number, amount: number, clientId: number, userId: number, description: string}){
  return this.httpClient.put(`${this.SERVER_URL + 'policies'}/${policy.id}`, policy)
}

private log(message: string) {
    
  console.log('PolicyService: ' + message);
}

private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}

}

