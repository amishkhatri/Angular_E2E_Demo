import { Component, OnInit } from '@angular/core';
import { PolicyService } from '../policy.service';
import { policydataitem } from '../model/policydataitem';

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.css']
})

export class PolicyListComponent 
{
  policyArray!: policydataitem[];

  
  policies: any[] = [];
  constructor(private policyService: PolicyService) { }

    ngOnInit()
      {
      this.getPolicyData()
    }

    getPolicyData (): void
    {

      this.policyService.getPolicies().subscribe
      (
          (data: any): void =>
          {
          console.log(data);
          this.policies = data;
          this.policyArray = data;
          }
      )

    }

    viewButton(policy : policydataitem):void
    {
      console.log(policy.id);
    }
      
    // navigateToPolicyDetail( policy : policydataitem ) :void
    // {

    //   const policyIdString = policy?.id.toString();

    //   this.router.navigate(['/policy-detail', policyIdString]);

    // }
    
    deleteButton(policy : policydataitem): void 
    {      
      const policyFiltered = this.policyArray?.filter(p => p !== policy);
      
      if (!policyFiltered)
      {    
        
        this.policyService.deletePolicy1(policy).subscribe();
        console.log('inside - False ');
      }

      if (policyFiltered)
      {
      
        this.policyService.deletePolicy1(policy).subscribe();
        console.log('inside  - True ');
      }

      this.policyArray = policyFiltered;


    }

 
}
