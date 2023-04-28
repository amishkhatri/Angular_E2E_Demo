import { Component, OnInit } from '@angular/core';
import { PolicyService } from '../policy.service';

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.css']
})

export class PolicyListComponent 
{
  policies: any[] = [];
  constructor(private policyService: PolicyService) { }

// getPoliciesFromService(): void{
//   this.policyService.getPolicies().subscribe(policies => this.policies = policies);

// }

  ngOnInit()
   {
//    this.getPoliciesFromService();

    this.policyService.getPolicies().subscribe
    (
        (data: any): void =>
        {
        console.log(data);
        this.policies = data;
        }
    )

  }

  delete(policyId: any): void {
    this.policies = this.policies.filter(p => p !== this.policies);
    this.policyService.deletePolicyById(policyId).subscribe();
  }

  // public delete(policyId: any){
  //   this.policyService.deletePolicyById(policyId).subscribe
  //   (
      
  //     (ret: any )=>
  //     {
  //         console.log("Policy deleted: ", ret);
  //     }
  //   )
//}


// public updatePolicy(policy: {id: number, amount: number, clientId: number, userId: number, description: string}){
//     let newPolicy:{id: number, amount: number, clientId: number, userId: number, description: string} 
//     = {policy.id, 0, 0, 0};
//     this.policyService.updatePolicy(policyId).subscribe((ret)=>{
//           console.log("Policy updated: ", ret);
//     });
// }  
}