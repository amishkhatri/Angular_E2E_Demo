//NEW RGKREFACTOR
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { StoreReducers } from '../../common/services/store.reducer';
import { DataSourceService } from './datasource.service';
import { ADD } from '../../common/services/store.action';
import { SharedService } from 'src/app/common/services/shared.service';
import { StateStoreService } from 'src/app/common/services/page-state-store.service';

@Injectable({ providedIn: 'root' })
export class VirtualDataSourceService {

  constructor(
    private stateStoreService: StateStoreService,
    private storeReducers: StoreReducers,
    private dataSourceService: DataSourceService,
    private sharedService: SharedService
  ) {}

  async physicalAssetFailureModeOptimizationVds
  (physicalAssetId, failureModeId, runInBackground)
   {
    
    const response = await 
    this.dataSourceService.physicalAssetFailureModeOptimization
    (physicalAssetId, failureModeId, runInBackground);
  
    
    if (response.hasError) {
      return this.handleError
      ('physicalAssetFailureModeOptimization', 
      response.errorMessage?.message);
    }

    const transformedData = 
    this.transformPhysicalAssetFailureModeTasks(response.response);
    this.stateStoreService.modifyAppState('physicalAssetFailureModeTasks', transformedData);
    
    this.storeReducers.globalReducer(
      { type: ADD, payload: transformedData },
      'physicalAssetFailureModeOptimizationVds'
    );

    return {
      dataSetName: 'physicalAssetFailureModeOptimizationVds',
      response: transformedData,
      errorMessage: '',
      hasError: false,
    };
  }

  private handleError(context: string, errorMessage: string): any {
    return {
      dataSetName: context,
      response: null,
      errorMessage,
      hasError: true,
    };
  }

  
  async chartDataForTaskVds(physicalAssetId, failureModeId, scheduledTaskId, runInBackground) {
  
    const response = await this.dataSourceService.chartDataForTask
    (physicalAssetId, failureModeId, scheduledTaskId, runInBackground);
    
    if (response.hasError) {
      return this.handleError('chartDataForTask', response.errorMessage?.message);
    }

    const transformedData = 
    this.transformChartDataForTask(response.response);
    
    this.storeReducers.globalReducer(
      { type: ADD, payload: transformedData },
      'chartDataForTaskVds'
    );

    return {
      dataSetName: 'chartDataForTaskVds',
      response: transformedData,
      errorMessage: '',
      hasError: false,
    };
  }


  private transformPhysicalAssetFailureModeTasks
  (data: any): any
   {

    const transformedTasks = 
    data.Tasks.map((failureObj: any) => 
    {
    
        const intervalObj = this.sharedService.getTimePeriod(failureObj.Interval);
        const optimizedIntervalObj = this.sharedService.getTimePeriod(failureObj.OptimizedInterval);

        const transformedFailureObj = {
            
            DisplayInterval: intervalObj.display || failureObj.Interval,
            intervalObj,
            DisplayMandatory: failureObj.IsMandatory ? 'Yes' : 'No',
            
        };

        if (failureObj.TaskType?.toLowerCase() === 'corrective') {
            transformedFailureObj.DisplayInterval = 'RTF';
            
        } else if (failureObj.TaskType?.toLowerCase() === 'condition monitoring') {
            transformedFailureObj.DisplayInterval = 'N/A';
            
        }

      return transformedFailureObj;

    });

    const failuremodeData = {

      current: transformedTasks.filter((failureObj: any) => failureObj.IsCurrent),
      optimized: transformedTasks.filter((failureObj: any) => failureObj.IsOptimized),
      custom: transformedTasks.map((failureObj: any) => ({ ...failureObj })),
      // ... other properties
    };

    return failuremodeData;
  }

  
  private transformChartDataForTask(data: any): any {
    const transformedIntervals = data.Intervals.map((interval: any) => {
      const proactiveCost = (interval.InspectionCost.TotalMaintenanceCost || 0) + (interval.PlannedCost.TotalMaintenanceCost || 0);
      const reactiveCost = (interval.CorrectiveCost.TotalMaintenanceCost || 0) + (interval.SecondaryActionCost.TotalMaintenanceCost || 0);

      const transformedInterval = {
        IntervalId: interval.IntervalId,
        IntervalName: interval.IntervalName,
        // ... other properties
        ProactiveCost: proactiveCost,
        ReactiveCost: reactiveCost,
      };

      const currency = this.sharedService.getCurrencyFormatAssetApp(interval.TotalCost);
      const unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
      transformedInterval.TotalCostDisplayValue = `${_.round(currency.value, 2)}${unit}`;

      const effectCurrency = this.sharedService.getCurrencyFormatAssetApp(interval.TotalEffectCost);
      const effectUnit = !_.isEmpty(effectCurrency.unit) ? ` ${effectCurrency.unit}` : '';
      transformedInterval.TotalEffectCostDisplayValue = `${_.round(effectCurrency.value, 2)}${effectUnit}`;

      const maintenanceCurrency = this.sharedService.getCurrencyFormatAssetApp(interval.TotalMaintenanceCost);
      const maintenanceUnit = !_.isEmpty(maintenanceCurrency.unit) ? ` ${maintenanceCurrency.unit}` : '';
      transformedInterval.TotalMaintenanceCostDisplayValue = `${_.round(maintenanceCurrency.value, 2)}${maintenanceUnit}`;

      const proactiveCurrency = this.sharedService.getCurrencyFormatAssetApp(proactiveCost);
      const proactiveUnit = !_.isEmpty(proactiveCurrency.unit) ? ` ${proactiveCurrency.unit}` : '';
      transformedInterval.ProactiveCostDisplayValue = `${_.round(proactiveCurrency.value, 2)}${proactiveUnit}`;

      const reactiveCurrency = this.sharedService.getCurrencyFormatAssetApp(reactiveCost);
      const reactiveUnit = !_.isEmpty(reactiveCurrency.unit) ? ` ${reactiveCurrency.unit}` : '';
      transformedInterval.ReactiveCostDisplayValue = `${_.round(reactiveCurrency.value, 2)}${reactiveUnit}`;

      return transformedInterval;
    });

    const transformedData = {
      ...data,
      Intervals: transformedIntervals,
    };

    return transformedData;
  }
  

}





  
