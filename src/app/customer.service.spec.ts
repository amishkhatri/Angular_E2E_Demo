import { TestBed } from '@angular/core/testing';
import { customerdataitem } from './model/customerdataitem';
import { CustomerService } from './customer.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;


  beforeEach(() => {
    // TestBed.configureTestingModule({
    //   imports: [HttpClientTestingModule],
    //   providers: [CustomerService]

    // });
    // service = TestBed.inject(CustomerService);

    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new CustomerService(httpClientSpy);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test getCustomer() Method', () => {

    //Arrange
   
    let  fakeCustomers:  customerdataitem[] =  [
      {  userId:  111,  clientId:  234, name: 'abc', type: 'Classic', city: 'Mumbai'},
      {  userId:  112,  clientId:  322, name: 'xyz', type: 'Executive', city: 'Mumbai'},
      {  userId:  113,  clientId:  657, name: 'pqr', type: 'Executive', city: 'Mumbai'}
     ];

     httpClientSpy.get.and.returnValue(of(fakeCustomers));

     service.getCustomers().subscribe({
      next: customers => {
        expect(customers)
          .withContext('expected customer')
          .toEqual(fakeCustomers);
        done();
      }
    });

    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);

  });
  
});


function done() {
  throw new Error('Function not implemented.');
}

