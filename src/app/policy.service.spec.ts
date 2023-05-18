import { inject, TestBed } from "@angular/core/testing"
import { PolicyService } from './policy.service';
import {HttpClientTestingModule,HttpTestingController} from "@angular/common/http/testing"


describe('PolicyService', () => {
  let service: PolicyService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // TestBed.configureTestingModule({});

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
     
    });
    
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PolicyService);
    
    //    service = TestBed.inject(PolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
