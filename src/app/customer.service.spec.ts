import { TestBed } from '@angular/core/testing';
import { customerdataitem } from './model/customerdataitem';
import { CustomerService } from './customer.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

//jasmine.createSpyObj =  is used to create a mock that will spy on one or more methods. 
// It returns an object that has a property for each string that is a spy.
describe("Multiple spies, when created manually", function () {

  //Create Mocks by createSpyObj
  const tape = jasmine.createSpyObj('tape', ['play', 'pause', 'stop', 'rewind']);

  tape.play();
  tape.pause();
  tape.rewind(0);

  it("creates spies for each requested function", function () {
    expect(tape.play).toBeDefined();
    expect(tape.pause).toBeDefined();
    expect(tape.stop).toBeDefined();
    expect(tape.rewind).toBeDefined();
  });

  it("tracks that the spies were called", function () {
    expect(tape.play).toHaveBeenCalled();
    expect(tape.pause).toHaveBeenCalled();
    expect(tape.rewind).toHaveBeenCalled();
    expect(tape.stop).not.toHaveBeenCalled();
  });

  it("tracks all the arguments of its calls", function () {

    expect(tape.rewind).toHaveBeenCalledWith(0);
  });
});

//jasmine.createSpy =  can be used when there is no function to spy on. 
//It will track calls and arguments like a spyOn but there is NO IMPLEMENTATION.
//Example Test Suite
describe("A spy is created manually (No Implementation)", function () {

  const whatAmI = jasmine.createSpy('whatAmI');
  whatAmI("I", "am", "a", "spy");

  it("is named, which helps in error reporting", function () {
    expect(whatAmI.and.identity.toString()).toEqual('whatAmI');
  });

  it("tracks that the spy was called", function () {
    const whatAmI = jasmine.createSpy('whatAmI');
    whatAmI("I", "am", "a", "spy");
    expect(whatAmI).toHaveBeenCalled();
  });

  it("tracks its number of calls", function () {
    const whatAmI = jasmine.createSpy('whatAmI');
    whatAmI("I", "am", "a", "spy");
    expect(whatAmI.calls.count()).toEqual(1);
  });

  it("tracks all the arguments of its calls", function () {
    const whatAmI = jasmine.createSpy('whatAmI');
    whatAmI("I", "am", "a", "spy");
    expect(whatAmI).toHaveBeenCalledWith("I", "am", "a", "spy");
  });

  it("allows access to the most recent call", function () {
    const whatAmI = jasmine.createSpy('whatAmI');
    whatAmI("I", "am", "a", "spy");
    expect(whatAmI.calls.mostRecent().args[0]).toEqual("I");
    expect(whatAmI.calls.mostRecent().args[1]).toEqual("am");
  });

});

describe("CustomerService with Mock", function () {

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController
  let service: CustomerService;

  beforeEach(() => {

    TestBed.configureTestingModule({
    
      imports: [HttpClientTestingModule],
      //System Under Test
      providers: [CustomerService]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CustomerService);

  });
  
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('Customers wiht getCustomers', (done: DoneFn)  => {
  
    let fakeCustomers: customerdataitem[] = [
      { userId: 111, clientId: 234, name: 'abc', type: 'Classic', city: 'Mumbai' },
      { userId: 112, clientId: 322, name: 'xyz', type: 'Executive', city: 'Mumbai' },
      { userId: 113, clientId: 657, name: 'pqr', type: 'Executive', city: 'Mumbai' }
    ];

    spyOn(service, 'getCustomers').and.returnValue(of(fakeCustomers));

     let customers: customerdataitem[] ;
    
    service.getCustomers().subscribe({
      next: customers => {
        expect(customers)
          .withContext('expected customer using mock')
          .toEqual(fakeCustomers);
        done();
      },
      error: done.fail
    });
    

  });


});

///Spy Example
describe('CustomerService with Spies', () => {
  let service: CustomerService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new CustomerService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test getCustomer() Method', (done: DoneFn) => {

    //Arrange
    let fakeCustomers: customerdataitem[] = [
      { userId: 111, clientId: 234, name: 'abc', type: 'Classic', city: 'Mumbai' },
      { userId: 112, clientId: 322, name: 'xyz', type: 'Executive', city: 'Mumbai' },
      { userId: 113, clientId: 657, name: 'pqr', type: 'Executive', city: 'Mumbai' }
    ];

    httpClientSpy.get.and.returnValue(of(fakeCustomers));

    service.getCustomers().subscribe({
      next: customers => {
        expect(customers)
          .withContext('expected customer')
          .toEqual(fakeCustomers);
        done();
      },
      error: done.fail
    });

    //Act
    const serviceCounts = httpClientSpy.get.calls.count()
    console.log('TEST calls' + serviceCounts)

    //Assert
    expect(serviceCounts)
      .withContext('one call')
      .toBe(1);
  
    });

});

