import { Component, OnInit } from '@angular/core';
import { PolicyService } from '../policy.service';
import { policydataitem } from '../model/policydataitem';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.css']
})

export class PolicyListComponent {
  policyArray!: policydataitem[];

  policies: any[] = [];
  constructor(private policyService: PolicyService) { }

  ngOnInit() {
    this.getPolicyData()
  }

  getPolicyData(): void {

    this.policyService.getPolicies().subscribe
      (
        (data: any): void => {
          console.log(data);
          this.policies = data;
          this.policyArray = data;
        }
      )

  }

  viewButton(policy: policydataitem): void {
    console.log(policy.id);
  }

  // navigateToPolicyDetail( policy : policydataitem ) :void
  // {

  //   const policyIdString = policy?.id.toString();

  //   this.router.navigate(['/policy-detail', policyIdString]);

  // }

  deleteButton(policy: policydataitem): void {

    // filter policy list
    const policyFiltered = this.filterPoliyList(policy);

    // when filtered
    try {
          if (!policyFiltered) this.policyService.deletePolicy1(policy).subscribe();
    } catch (error) {
      throw new Error("eror while deletion")
    }
    
    //Data bind
    this.DataBind(policyFiltered);

  }


  private DataBind(policyFiltered: policydataitem[]) {
    this.policyArray = policyFiltered;
  }

  private filterPoliyList(policy: policydataitem) {
    return this.policyArray?.filter(p => p !== policy);
  }
}
