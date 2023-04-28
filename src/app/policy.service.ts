import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private httpClient: HttpClient) { }
  SERVER_URL: string = 'http://localhost:8080/api/';

  public getPolicies()
  {
    return this.httpClient.get(this.SERVER_URL + 'policies')
  }

  
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

}
