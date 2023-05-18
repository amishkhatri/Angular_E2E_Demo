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


deleteButton(policy : policydataitem): void 
{
  
  const p1 = this.policyArray?.filter(p => p == policy);
  if (p1)
  {
    this.policyService.deletePolicy1(policy).subscribe();
  }

  console.log('delete');
}

 
 

}
