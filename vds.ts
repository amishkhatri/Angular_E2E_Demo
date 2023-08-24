import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { StoreReducers } from '../../common/services/store.reducer';
import { DataSourceService } from './datasource.service';
import { ADD } from '../../common/services/store.action';
import { SharedService } from 'src/app/common/services/shared.service';
import { StateStoreService } from 'src/app/common/services/page-state-store.service';

@Injectable({ providedIn: 'root' })
export class VirtualDataSourceService {

  constructor(private stateStoreService: StateStoreService, 
    private storeReducers: StoreReducers, 
    private dataSourceService: DataSourceService, 
    private sharedService: SharedService) { }


  
  /* Method to perform virtual data source call */
  async physicalAssetFailureModeOptimizationVds
  (physicalAssetId, failureModeId, runInBackground) {
    
    let finalOutput: any = null;
    let errorMessage: string = '';
    let hasError: boolean = false;
    let ids_physicalassetfailuremodeoptimization: any;
    
    await this.dataSourceService
      .physicalAssetFailureModeOptimization(physicalAssetId, failureModeId, runInBackground)
      .then((res: any) => {
        hasError = !hasError ? res.hasError : hasError;
        if (!hasError) {
          ids_physicalassetfailuremodeoptimization = res.response;
          finalOutput = ids_physicalassetfailuremodeoptimization;

          const physicalAssetFailureModeTasks = _.cloneDeep(res.response);
          this.stateStoreService.modifyAppState('physicalAssetFailureModeTasks', physicalAssetFailureModeTasks);       
        }  else {
          errorMessage += `physicalAssetFailureModeOptimization: ` + res.errorMessage?.message + `\n`;
        }
      });

    /*  physicalAssetFailureModeOptimizationVds */
    const trf_var = 
    this.physicalAssetFailureModeOptimizationVdstrf_var(
      ids_physicalassetfailuremodeoptimization);
    finalOutput = trf_var;

    this.storeReducers.globalReducer(
      {
        type: ADD,
        payload: finalOutput,
      },
      'physicalAssetFailureModeOptimizationVds'
    );

    return {
      dataSetName: 'physicalAssetFailureModeOptimizationVds',
      response: finalOutput,
      errorMessage,
      hasError,
    };
  }

  physicalAssetFailureModeOptimizationVdstrf_var(ids_physicalassetfailuremodeoptimization) {
    let failuremodeData = null;
    if (ids_physicalassetfailuremodeoptimization && ids_physicalassetfailuremodeoptimization.Tasks) {
      failuremodeData = {
        current: [],
        optimized: [],
        custom: [],
        hasActiveApproval: ids_physicalassetfailuremodeoptimization.HasActiveApproval,
        hasMadatoryTask: false
      };
      ids_physicalassetfailuremodeoptimization.Tasks.forEach((failureObj) => {
        
        const intervalFn = this.sharedService.getTimePeriod;
        const intervalObj = intervalFn(failureObj['Interval']);

        if (!failuremodeData.hasMadatoryTask && failureObj.IsMandatory) {
          failuremodeData.hasMadatoryTask = true;
        }

        failureObj['DisplayInterval'] = intervalObj.display || failureObj['Interval'];
        failureObj['intervalObj'] = intervalObj;
        failureObj['DisplayMandatory'] = failureObj.IsMandatory ? 'Yes' : "No";

        const currency = this.sharedService.getCurrencyFormatAssetApp(failureObj['AnnualTotalCost']);
        const unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
        
        failureObj['AnnualDownTime'] = _.round(failureObj['AnnualDownTime'], 2);
        failureObj['AnnualLaborHours'] = _.round(failureObj['AnnualLaborHours'], 2);
        failureObj['AnnualTotalCostDisplayValue'] = `${_.round(currency.value, 2)}${unit}`;
        failureObj['CostBenefitPercentage'] = _.round(100 - failureObj['CostBenefitPercentage'], 2);

        const optimizedIntervalObj = intervalFn(failureObj['OptimizedInterval']);
        failureObj['optimizedDisplayInterval'] = optimizedIntervalObj.display || failureObj['OptimizedInterval'];
        failureObj['optimizedIntervalObj'] = optimizedIntervalObj;

        const optimisedCurrency = this.sharedService.getCurrencyFormatAssetApp(failureObj['OptimizedAnnualTotalCost']);
        const optimisedUnit = !_.isEmpty(optimisedCurrency.unit) ? ` ${optimisedCurrency.unit}` : '';
        failureObj['OptimizedAnnualDownTime'] = _.round(failureObj['OptimizedAnnualDownTime'], 2);
        failureObj['OptimizedAnnualLaborHours'] = _.round(failureObj['OptimizedAnnualLaborHours'], 2);
        failureObj['optimizedAnnualTotalCostDisplayValue'] = `${_.round(optimisedCurrency.value, 2)}${optimisedUnit}`;
        failureObj['OptimizedCostBenefitPercentage'] = _.round(100 - failureObj['OptimizedCostBenefitPercentage'], 2);

        if (failureObj['TaskType']?.toLowerCase() === 'corrective') {
          failureObj['DisplayInterval'] = 'RTF';
          failureObj['CostBenefitPercentage'] = 0;
          failureObj['Interval'] = null;
          failureObj['optimizedDisplayInterval'] = 'RTF';
          failureObj['OptimizedCostBenefitPercentage'] = 0;
          failureObj['OptimizedInterval'] = null;
          failureObj['DisplayMandatory'] = 'N/A'
        } else if (failureObj['TaskType']?.toLowerCase() === 'condition monitoring') {
          failureObj['DisplayInterval'] = 'N/A';
          failureObj['Interval'] = null;
          failureObj['optimizedDisplayInterval'] = 'N/A';
          failureObj['OptimizedInterval'] = null;
        }
        failureObj['displayTaskName'] = failureObj.TaskType;
        if (failureObj['IsCurrent']) {
          failuremodeData.current.push(failureObj);
        }
        if (failureObj['IsOptimized']) {
          failuremodeData.optimized.push(failureObj);
        }
        failuremodeData.custom.push({ ...failureObj });
      });
    }
    return failuremodeData;
  }
  /* Method to perform virtual data source call */
  async chartDataForTaskVds(physicalAssetId, failureModeId, scheduledTaskId, runInBackground) {
    let finalOutput: any = null;
    let ids_chartdatafortask: any;
    let errorMessage: string = '';
    let hasError: boolean = false;
    await this.dataSourceService
      .chartDataForTask(physicalAssetId, failureModeId, scheduledTaskId, runInBackground)
      .then((res: any) => {
        hasError = !hasError ? res.hasError : hasError;
        if (!hasError) {
          ids_chartdatafortask = res.response;
          finalOutput = ids_chartdatafortask;
        } else {
          errorMessage += `chartDataForTask: ` + res.errorMessage?.message + `\n`;
        }
      });
    /*  chartDataForTaskVds */
    const trf_var = this.chartDataForTaskVdstrf_var(ids_chartdatafortask);
    finalOutput = trf_var;

    this.storeReducers.globalReducer(
      {
        type: ADD,
        payload: finalOutput,
      },
      'chartDataForTaskVds'
    );

    return {
      dataSetName: 'chartDataForTaskVds',
      response: finalOutput,
      errorMessage,
      hasError,
    };
  }

  chartDataForTaskVdstrf_var(ids_chartdatafortask) {
    if (ids_chartdatafortask && ids_chartdatafortask.Intervals && ids_chartdatafortask.Intervals.length) {
      ids_chartdatafortask.Intervals.forEach((t) => {
        let currency = null,
          unit = '';
        t['ProactiveCost'] =
          (t['InspectionCost'].TotalMaintenanceCost || 0) + (t['PlannedCost'].TotalMaintenanceCost || 0);
        t['ReactiveCost'] =
          (t['CorrectiveCost'].TotalMaintenanceCost || 0) + (t['SecondaryActionCost'].TotalMaintenanceCost || 0);
        currency = this.sharedService.getCurrencyFormatAssetApp(t['TotalCost']);
        unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
        t['TotalCostDisplayValue'] = `${_.round(currency.value, 2)}${unit}`;

        currency = this.sharedService.getCurrencyFormatAssetApp(t['TotalEffectCost']);
        unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
        t['TotalEffectCostDisplayValue'] = `${_.round(currency.value, 2)}${unit}`;

        currency = this.sharedService.getCurrencyFormatAssetApp(t['TotalMaintenanceCost']);
        unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
        t['TotalMaintenanceCostDisplayValue'] = `${_.round(currency.value, 2)}${unit}`;

        currency = this.sharedService.getCurrencyFormatAssetApp(t['ProactiveCost']);
        unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
        t['ProactiveCostDisplayValue'] = `${_.round(currency.value, 2)}${unit}`;

        currency = this.sharedService.getCurrencyFormatAssetApp(t['ReactiveCost']);
        unit = !_.isEmpty(currency.unit) ? ` ${currency.unit}` : '';
        t['ReactiveCostDisplayValue'] = `${_.round(currency.value, 2)}${unit}`;
      });
    }
    return ids_chartdatafortask || null;
  }
}
