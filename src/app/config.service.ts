// Configuration file to define a configuration object that 
//contains a flag indicating whether to use the mock data service or the real backend service.

export class ConfigService {
    private useMockService: boolean = true;
  
    public useMock(): boolean {
      return this.useMockService;
    }
  
    public setUseMock(value: boolean): void {
      this.useMockService = value;
    }
  }
  