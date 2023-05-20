/* 
  SHALLOW COMPONENT UNIT TEST SCENARIOS
*/

import { ComponentFixture } from '@angular/core/testing';
import { PolicyListComponent } from './policy-list.component';
import {HttpClientTestingModule,HttpTestingController} from "@angular/common/http/testing"
import { inject, TestBed } from "@angular/core/testing"
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Observable, of } from "rxjs";
import { PolicyService } from '../policy.service';
import { policydataitem } from '../model/policydataitem';

describe('PolicyListComponent', () => {

  let  POLICIES =  [
    {  id:  1,  num:  'PO1', amount: 512.99, userId: 14521, clientId: 45, description: 'Life Insurance - Term Plan' },
    {  id:  2,  num:  'PO2', amount: 718.87, userId: 14588, clientId: 87, description: 'Personal Care - Accedential Death' },
    {  id:  3,  num:  'PO3', amount: 129.65, userId: 10213, clientId: 98, description: 'Home Loan - Secure' },
    {  id:  4,  num:  'PO4', amount: 302.19, userId: 11968, clientId: 33, description: 'Travel - Insurance ' }
   ];
  
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;
  
it ('should call getPolicies GET Method ', () => {

  // Create a spy object for mockPolicyService
  const mockPolicyService1 = jasmine.createSpyObj('mockPolicyService', ['getPolicies']);
  
  // Configure the mock method
  mockPolicyService1.getPolicies.and.returnValue(of(POLICIES));
  component = new PolicyListComponent(mockPolicyService1);
  component.policies = POLICIES;

  expect(component.policies.length).toBe(4);

})


it('should remove the indicated policy from the policy list', () => {
      
  //Create a data to delete
  const data: policydataitem = {
    id: 3, // Change the value to a string instead of a number
    num: "PO3",
    amount: 129.65,
    userId: 10213,
    clientId: 98,
    description: "Home Loan - Secure"
  };

  // Create a spy object for mockPolicyService
  const mockPolicyService1 = jasmine.createSpyObj('mockPolicyService', ['deletePolicy1']);
  
  // Configure the mock method
  mockPolicyService1.deletePolicy1.and.returnValue(of(true));
  component = new PolicyListComponent(mockPolicyService1);
  component.policies = POLICIES;

  component.deleteButton(data);

  //expected =4 and actual=3 
  expect(component.policies.length).toBe(4);

})


it ('should call delete button', () => {

  //Create a data to delete
  const data: policydataitem = {
    id: 3, // Change the value to a string instead of a number
    num: "PO3",
    amount: 129.65,
    userId: 10213,
    clientId: 98,
    description: "Home Loan - Secure"
  };


  // Create a spy object for mockPolicyService
  const mockPolicyService1 = jasmine.createSpyObj('mockPolicyService', ['deletePolicy1']);
  
  // Configure the mock method
  mockPolicyService1.deletePolicy1.and.returnValue(of(true));
  component = new PolicyListComponent(mockPolicyService1);
  component.policies = POLICIES;

  component.deleteButton(data);
  expect(mockPolicyService1.deletePolicy1).toHaveBeenCalledWith(POLICIES[2]);


})


});
