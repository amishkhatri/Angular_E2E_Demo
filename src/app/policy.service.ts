import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { policydataitem } from './model/policydataitem'

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


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

  /** GET Policy by id. Will 404 if id not found */
  getPolicyById(id: number): Observable<policydataitem> {
    const url = `${this.SERVER_URL}+${id}`;
    return this.httpClient.get<policydataitem>(url).pipe(
      tap(_ => this.log(`fetched policy id=${id}`)),
      catchError(this.handleError<policydataitem>(`getPolicyById Policyid=${id}`))
    );
  }

    // /** PUT: update the policy on the server */
  updatePolicy (policy: policydataitem): Observable<any> {
    return this.httpClient.put(this.SERVER_URL, policydataitem, httpOptions).pipe(
      tap(_ => this.log(`updated policy id=${policy.id}`)),
      catchError(this.handleError<any>('updatepolicy'))
    );
  }


  //   // /** DELETE: delete the policy from the server */
  deletePolicy1(policy: policydataitem | number): Observable<policydataitem> {
    const id = typeof policy === 'number' ? policy : policy.id;
    //TO DO - update the below url which is 'http://localhost:8080/api/ + 1' - wrong
    //const url = `${this.SERVER_URL}` + `${id}`;
     const url = `${this.SERVER_URL + 'policies'}/${id}`;    

    return this.httpClient.delete<policydataitem>(url,httpOptions).pipe(
      tap(_ => this.log(`deleted policy id=${id}`)),
      catchError(this.handleError<policydataitem>('deletepolicy1'))
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

  // public getPolicyById(policyId: any)
  // {
  //   //const url = `${this.SERVER_URL}/?policyId=${policyId}`;

  //   //return this.httpClient.get(url);

  //   return this.httpClient.get(`${this.SERVER_URL + 'policies'}/${policyId}`);

   
  // }
 
public createPolicy(policy: {id: number, amount: number, clientId: number, userId: number, description: string}){
    return this.httpClient.post(`${this.SERVER_URL + 'policies'}`, policy)
}


// public updatePolicy(policy: {id: number, amount: number, clientId: number, userId: number, description: string}){
//   return this.httpClient.put(`${this.SERVER_URL + 'policies'}/${policy.id}`, policy)
// }

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

