import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/common/services/shared.service';
import { PageStateStoreService } from 'src/app/common/services/page-state-store.service';
import * as _ from 'lodash';
import { errorMessages } from 'src/app/common/constants/app-constants';
import { VirtualDataSourceService } from 'src/app/components/services/virtualdatasource.service';
import { Router } from '@angular/router';
import pageRouteData from 'src/assets/json/pageRoute.json';
import applicationVariables from 'src/assets/json/application.json';
import { cloneDeep } from 'lodash';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';

@Component({
  selector: 'app-strategy',
  templateUrl: './strategy.component.html',
  styleUrls: ['./strategy.component.scss'],
})
export class StrategyComponent implements OnInit, OnDestroy, AfterViewInit {
  /* Component constant */
  dataStore: any = {};
  nestedPageState: any = {};
  loadNestedComponent = false;
  errorMessagesMapped: any = errorMessages;
  appVariables: any = applicationVariables;

  /* variables of save var etc */
  activeKeySet: any;
  selectedFunctionalFailureTab: any;
  selectedFunctionTab: any;
  selectedFailureModeTab: any;
  selectedActionTab: any;
  isLoadingInitiated: any;
  assetSelectedPassedData: any;
  activeKeyTab: any;
  detailsloader: any;
  pageTitle: any;
  selectedDiagramTabs: any;
  tabMenu: any;
  selectedAppliedAssetTab: any;
  selectedStrategyFrameworkTab: any;
  tabMenuTopSet: any;
  activeKeyTopTab: any;
  physicalAssetId: any;
  AssetExpandableList: any;
  assetstrategieslistTable: any;
  menuDetails: any;
  list1Details: any;
  list2Details: any;
  list3Details: any;
  TaskType: any;
  footerClass: any = 'startegy-footer';
  /* Widgets variable model */
  labelModel: any = {
    customCSS: null,
    isVisible: true,
    visibility: null,
    scopeList: true,
    isloader: null,
    htmlSnippet: { events: ['click'], template: '<h1 id="test">Heading is here</h1>' },
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
  };
  card1Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isVisible: false,
    isloader: null,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 1,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
    visibility: null,
    scopeList: true,
    widgetIndex: 1,
  };
  card2Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isloader: null,
    isVisible: false,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 0,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    visibility: null,
    scopeList: true,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '|20~px|32~px|10~px|32~px|' },
    widgetIndex: 2,
  };
  buttonTab3Model: any = {
    customCSS: null,
    isVisible: true,
    visibility: null,
    scopeList: true,
    isloader: null,
    items: [
      { key: 'example-item-1', icon: 'account_circle', label: 'Tab Item 1' },
      { key: 'example-item-2', icon: 'account_circle', label: 'Tab Item 2' },
      { key: 'example-item-3', icon: 'account_circle', label: 'Tab Item 3' },
      { key: 'example-item-4', icon: 'account_circle', label: 'Tab Item 4' },
      { key: 'example-item-5', icon: 'account_circle', label: 'Tab Item 5' },
    ],
    isSmall: false,
    tooltipMessage: '',
    menuWidth: 'fluid',
    activeKey: '',
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
  };
  card4Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isloader: null,
    isVisible: false,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 0,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    visibility: null,
    scopeList: true,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
    widgetIndex: 4,
  };
  card5Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isloader: null,
    isVisible: false,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 0,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    visibility: null,
    scopeList: true,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
    widgetIndex: 5,
  };
  card6Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isloader: null,
    isVisible: false,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 0,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    visibility: null,
    scopeList: true,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
    widgetIndex: 6,
  };
  card7Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isloader: null,
    isVisible: false,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 0,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    visibility: null,
    scopeList: true,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
    widgetIndex: 7,
  };
  card8Model: any = {
    customCSS: null,
    openIcon: null,
    closeIcon: null,
    accordionTitle: 'Form Builder',
    isAccordion: false,
    isAccordionCollapsed: false,
    subscribeValueChange: false,
    accordionTitleStyle: null,
    subscribeVariables: null,
    isVisible: false,
    isloader: null,
    cardCounter: null,
    widgetId: null,
    controlId: 'Card',
    widgetMargin: 1,
    cardDataSet: [{}],
    isRepeatCard: false,
    isForm: false,
    tabs: null,
    cssProperties: { width: '100~%|||', height: '100~%|||', margin: '||32~px||32~px|' },
    visibility: null,
    scopeList: true,
    widgetIndex: 8,
  };
  footer9Model: any = {
    visibility: null,
  };
  appState: any = {};
  private subList = new Subscription();
  masterPageState: any = {};
  configDetail: any;
  constructor(
    private sharedService: SharedService,
    private pageStateStoreService: PageStateStoreService,
    private virtualDSService: VirtualDataSourceService,
    private router: Router,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  public ngOnInit() {
    /* Init ---page*/

    this.pageSubscibers();
    this.configDetail= this.sharedService.getConfig();
    this.pageInit();
  }
  ngAfterViewInit(): void {}

  /* istanbul ignore next */
  pageSubscibers() {
    this.subList.add(
      this.pageStateStoreService.dataStore.subscribe((dataStore: any) => {
        this.dataStore = dataStore.data;
        const keys: string[] = [];
        for (const property in dataStore.data) {
          /* updateDataStoreInPageState And nestedPageState*/
          keys.push(property);
          this.nestedPageState[property] = this[property] = { [property]: dataStore.data[property], keys };
        }
        this.setConfiguredData(dataStore.stateName);
      })
    );
    this.subList.add(
      this.pageStateStoreService.appStore.subscribe((appStore: any) => {
        if (appStore && appStore.data && appStore.data.AppComponent) {
          this.appState = appStore.data.AppComponent;
          this.setConfiguredData(appStore.stateName);
        }
      })
    );
    this.subList.add(
      this.pageStateStoreService.reloadPageLoadEvents.subscribe((data: any) => {
        if (data) {
          this.pageInit();
        }
      })
    );
    this.subList.add(
      this.pageStateStoreService.masterPageStore.subscribe((masterPageStore: any) => {
        if (masterPageStore && masterPageStore.data && masterPageStore.data.RiskmasterpageComponent) {
          this.masterPageState = masterPageStore.data.RiskmasterpageComponent;
          this.setConfiguredData(masterPageStore.stateName);
        }
      })
    );
    this.subList.add(
      this.pageStateStoreService.pageStore.subscribe((pageStore: any) => {
        const pageStoreVal = cloneDeep(pageStore);
        setTimeout(() => {
          if (pageStoreVal && pageStoreVal.data && pageStoreVal.data.pageName === 'StrategyComponent') {
            const changes = pageStoreVal.data['StrategyComponent'].changes;
            this[changes.key] = changes.value; /* update in page*/
            const change = {
              [changes.key]: changes.value,
            };
            this.nestedPageState = {
              ...this.nestedPageState,
              ...change,
              keys: [pageStoreVal.stateName],
            }; /* update in nested components state*/
            this.setConfiguredData(pageStoreVal.stateName);
          }
        }, 0);
      })
    );
    this.subList.add(
      this.sharedService.callPageListener$.subscribe(() => {
        this.pageInit(true);
      })
    );
  }
  async pageInit(isReload: boolean = false) {
    let nestedPageState: any = {};
    const routingData = this.sharedService.getRouteParams();
    for (const property in routingData) {
      nestedPageState[property] = this[property] = routingData[property];
    }
    this.isLoadingInitiated = false;
    this.buttonTab3Model.visibility = this.isLoadingInitiated ? true : false;
    this.footer9Model.visibility = this.isLoadingInitiated ? true : false;
    this.sharedService.setSharedData({'assetSelectedPassedData': this.setAssetSelectedPassedData1(null)});
    this.sharedService.setSharedData({'activeKeyTab': 'asset-strategy'});
    this.detailsloader = this.setDetailsloader3(null);
    this.sharedService.setSharedData({'pageTitle':{text: 'Turbine Generator Strategy (GEN-TRB-008)',pageName: 'assetstrategydetails',pageIndex: 3}})
    this.selectedDiagramTabs = [];
    this.selectedFunctionTab = false;
    this.detailsloader = { loader: false };
    this.selectedFunctionalFailureTab = this.setSelectedFunctionalFailureTab8(null);
    this.selectedFailureModeTab = this.setSelectedFailureModeTab9(null);
    this.selectedActionTab = this.setSelectedActionTab10(null);
    this.tabMenu = [{label: 'Function', key: 'functionTab'},{label: 'Function Failures',key: 'functionFailureTab'},{ label: 'Failure Modes',key: 'functionFailureModeTab'},{label: 'Actions',key: 'actionsTab'}];
    this.selectedAppliedAssetTab = false
    this.selectedStrategyFrameworkTab = true 
    this.activeKeySet = this.setActiveKeySet14(null);
    this.tabMenuTopSet = this.setTabMenuTopSet15(null);
    this.activeKeyTopTab = 'strategyFramework';
    this.physicalAssetId = this.setPhysicalAssetId17(null);
    const assetExpandableListResData: any = await this.virtualDSService.assetExpandableList(this.physicalAssetId,false);
    if (!assetExpandableListResData.hasError) {
      nestedPageState.AssetExpandableList = this.AssetExpandableList = {
        AssetExpandableList: assetExpandableListResData.response,
      };
      this.sharedService.setSharedData({AssetExpandableList: assetExpandableListResData.response})
    } else {
      nestedPageState.AssetExpandableList = this.AssetExpandableList = {
        AssetExpandableList: assetExpandableListResData.errorMessage,
      };
      this.sharedService.setSharedData({AssetExpandableList: assetExpandableListResData.errorMessage})
    }
    const assetstrategieslistTable1ResData: any = await this.virtualDSService.assetstrategieslistTable(this.physicalAssetId,false);
    if (!assetstrategieslistTable1ResData.hasError) {
      nestedPageState.assetstrategieslistTable = this.assetstrategieslistTable = {
        assetstrategieslistTable: assetstrategieslistTable1ResData.response,
      };
      this.sharedService.setSharedData({ assetstrategieslistTable: assetstrategieslistTable1ResData.response})
    } else {
      nestedPageState.assetstrategieslistTable = this.assetstrategieslistTable = {
        assetstrategieslistTable: assetstrategieslistTable1ResData.errorMessage,
      };
      this.sharedService.setSharedData({ assetstrategieslistTable: assetstrategieslistTable1ResData.errorMessage})
    }

    /* SaveVar for Page Load */
    nestedPageState.menuDetails = this.menuDetails = this.setMenuDetails18(null);
    this.setConfiguredData('menuDetails');
    this.sharedService.setSharedData({'menuDetails':this.setMenuDetails18(null)})
    /* SaveVar for Page Load */
    nestedPageState.list1Details = this.list1Details = this.setList1Details19(null);
    this.setConfiguredData('list1Details');
    /* SaveVar for Page Load */
    nestedPageState.list2Details = this.list2Details = this.setList2Details20(null);
    this.setConfiguredData('list2Details');
    /* SaveVar for Page Load */
    nestedPageState.list3Details = this.list3Details = this.setList3Details21(null);
    this.setConfiguredData('list3Details');
    nestedPageState.TaskType = this.TaskType = "SC";
    this.setConfiguredData('TaskType');
    this.sharedService.setSharedData({'activeKeyTab': "asset-strategy"});
    /* SaveVar for Page Load */
    this.isLoadingInitiated = true;
    this.buttonTab3Model.visibility = this.isLoadingInitiated ? true : false;
    this.footer9Model.visibility = this.isLoadingInitiated ? true : false;
    /* Dynamic routing generation */
    const widgetEventData = null;
    let selectedRoute: any = this.DynamicRouting(widgetEventData);
    this.dynamicRouteMapping(selectedRoute, widgetEventData);

    this.nestedPageState = { ...nestedPageState };
    this.setConfiguredData();
    this.loadNestedComponent = true;
    if (isReload) {
      setTimeout(() => {
        this.nestedPageState = { ...this.nestedPageState, ...{ isReloadRequired: true } };
      }, 0);
    }
  }

 
  /* Save var methods */
  setAssetSelectedPassedData1(data: any) {
    let selectedData = null;
    if (this.sharedService?.sharedData?.assetSelection) {
      selectedData = this.sharedService?.sharedData?.assetSelection;
      if(this.configDetail && this.configDetail.cordantApp){
        localStorage.setItem('assetSelectedData', JSON.stringify(selectedData));
      }
    } else if (localStorage.getItem('assetSelectedData') !== null) {
      selectedData = JSON.parse(localStorage.getItem('assetSelectedData'));
    }

    return selectedData;
  }

  /* Save var methods */
  setDetailsloader3(data: any) {
    return {
      count: '1',
      theme: {
        'border-radius': '5px',
        height: '22px',
        'background-color': 'var(--color-fill-form-disabled)',
        'animation-duration': '2s',
      },
      loader: true,
      appearance: '',
    };
  }


  /* Save var methods */
  setSelectedFunctionalFailureTab8(data: any) {
    if (this.sharedService?.sharedData?.breadcrumbAssetSelection && this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId) {
      return false;
    } else {
      return true;
    }
  }
  /* Save var methods */
  setSelectedFailureModeTab9(data: any) {
    if (
      this.sharedService?.sharedData?.breadcrumbAssetSelection &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.subTab === 'functionFailureModeTab'
    ) {
      return true;
    } else {
      return false;
    }
  }
  /* Save var methods */
  setSelectedActionTab10(data: any) {
    if (
      this.sharedService?.sharedData?.breadcrumbAssetSelection &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.subTab === 'actionsTab'
    ) {
      return true;
    } else {
      return false;
    }
  }
 

 
  /* Save var methods */
  setActiveKeySet14(data: any) {
    if (
      this.sharedService?.sharedData?.breadcrumbAssetSelection &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.subTab === 'functionFailureModeTab'
    ) {
      return 'functionFailureModeTab';
    } else if (
      this.sharedService?.sharedData?.breadcrumbAssetSelection &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj &&
      this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.subTab === 'actionsTab'
    ) {
      return 'actionsTab';
    } else {
      return 'functionFailureTab';
    }
  }
  /* Save var methods */
  setTabMenuTopSet15(data: any) {
    return [
      {
        key: 'strategyFramework',
        label: 'Strategy Framework',
      },
      {
        key: 'appliedAssetTab',
        label: 'Applied Assets',
      },
    ];
  }

  /* Save var methods */
  setPhysicalAssetId17(data: any) {
    let assetId = '2dae8bc4-b22d-4491-945b-305309e41865';
    if (this.sharedService?.sharedData?.assetSelectedPassedData && this.sharedService?.sharedData?.assetSelectedPassedData.selectedNode) {
      assetId = this.sharedService?.sharedData?.assetSelectedPassedData.selectedNode.id;
    }
    return assetId;
  }
  /* Save var methods */
  setMenuDetails18(data: any) {
    let itemObj = {};
    if (this.sharedService?.sharedData?.AssetExpandableList) {
      if (this.sharedService?.sharedData?.breadcrumbAssetSelection && this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId) {
        let fnId = this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId;
        let finalObj = this.sharedService?.sharedData?.AssetExpandableList.Function.filter((item) => item.Id === fnId);
        itemObj = {
          id: finalObj[0].Id,
          name: finalObj[0].name,
          value: finalObj[0].value,
        };
      } else {
        if (
          this.sharedService?.sharedData?.AssetExpandableList.Function &&
          this.sharedService?.sharedData?.AssetExpandableList.Function.length > 0
        ) {
          itemObj = {
            id: this.sharedService?.sharedData?.AssetExpandableList.Function[0].Id,
            name: this.sharedService?.sharedData?.AssetExpandableList.Function[0].name,
            value: this.sharedService?.sharedData?.AssetExpandableList.Function[0].value,
          };
        }
      }
    }

    return itemObj;
  }
  /* Save var methods */
  setList1Details19(data: any) {
    
    let itemObj = {};
    if (this.sharedService?.sharedData?.AssetExpandableList) {
      if (this.sharedService?.sharedData?.breadcrumbAssetSelection && this.sharedService?.sharedData?.breadcrumbAssetSelection.functionalFailureId) {
        let fnId = this.sharedService?.sharedData?.breadcrumbAssetSelection.functionalFailureId;
        let finalObj = this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures.filter(
          (item) => item.childId === fnId
        );
        itemObj = {
          value: finalObj[0].value,
          childId: finalObj[0].childId,
          name: finalObj[0].name,
          parentId: finalObj[0].parentId,
        };
      } else {
        if (
          this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures &&
          this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures.length > 0
        ) {
          itemObj = {
            value: this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures[0].value,
            childId: this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures[0].childId,
            name: this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures[0].name,
            parentId: this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures[0].parentId,
          };
        }
      }
    }

    return itemObj;
  }
  /* Save var methods */
  setList2Details20(data: any) {
    let itemObj = {};
    if (this.sharedService?.sharedData?.AssetExpandableList) {
      if (
        this.sharedService?.sharedData?.breadcrumbAssetSelection &&
        this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj &&
        this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.data &&
        this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.data.grandChildId
      ) {
        let fnId = this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.data.grandChildId;
        let finalObj = this.sharedService?.sharedData?.AssetExpandableList.FailureModes.filter(
          (item) => item.grandChildId === fnId
        );
        itemObj = {
          value: finalObj[0].value,
          grandChildId: finalObj[0].grandChildId,
          grandParentId: finalObj[0].grandParentId,
          name: finalObj[0].Name,
          Description: finalObj[0].Description,
          Effects: finalObj[0].Effects,
          PartName: finalObj[0].PartName,
          ModeName: finalObj[0].ModeName,
          CauseName: finalObj[0].CauseName,
          Distribution: finalObj[0].Distribution,
          DemandFrequency: finalObj[0].DemandFrequency,
          IsDormant: finalObj[0].isDormant,
          Eta1: finalObj[0].Eta1,
          Eta2: finalObj[0].Eta2,
          Eta3: finalObj[0].Eta3,
          Beta1: finalObj[0].Beta1,
          Beta2: finalObj[0].Beta2,
          Beta3: finalObj[0].Beta3,
          MTTF: finalObj[0].MTTF,
          Gamma1: finalObj[0].Gamma1,
          Gamma2: finalObj[0].Gamma2,
          Gamma3: finalObj[0].Gamma3,
          StandardDeviation: finalObj[0].StandardDeviation,
          AlarmPfCurve: finalObj[0].AlarmPfCurve,
          AlarmDescription: finalObj[0].AlarmDescription,
          AlarmCapitalCost: finalObj[0].AlarmCapitalCost,
          AlarmPFInterval: finalObj[0].AlarmPFInterval,
          AlarmUnitCostRate: finalObj[0].AlarmUnitCostRate,
          AlarmIsEnabled: finalObj[0].AlarmIsEnabled,
          AlarmSCADATag: finalObj[0].AlarmSCADATag,
          AlarmDetectionProbability: finalObj[0].AlarmDetectionProbability,
        };
      } else {
        if (
          this.sharedService?.sharedData?.AssetExpandableList.FailureModes &&
          this.sharedService?.sharedData?.AssetExpandableList.FailureModes.length > 0
        ) {
          itemObj = {
            value: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].value,
            grandChildId: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].grandChildId,
            grandParentId: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].grandParentId,
            name: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Name,
            Description: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Description,
            Effects: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Effects,
            PartName: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].PartName,
            ModeName: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ModeName,
            CauseName: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].CauseName,
            Distribution: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Distribution,
            DemandFrequency: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].DemandFrequency,
            IsDormant: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].isDormant,
            Eta1: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Eta1,
            Eta2: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Eta2,
            Eta3: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Eta3,
            Beta1: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Beta1,
            Beta2: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Beta2,
            Beta3: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Beta3,
            MTTF: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].MTTF,
            Gamma1: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Gamma1,
            Gamma2: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Gamma2,
            Gamma3: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Gamma3,
            StandardDeviation: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].StandardDeviation,
            AlarmPfCurve: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmPfCurve,
            AlarmDescription: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmDescription,
            AlarmCapitalCost: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmCapitalCost,
            AlarmPFInterval: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmPFInterval,
            AlarmUnitCostRate: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmUnitCostRate,
            AlarmIsEnabled: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmIsEnabled,
            AlarmSCADATag: this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmSCADATag,
            AlarmDetectionProbability:
              this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].AlarmDetectionProbability,
          };
        }
      }
    }
    return itemObj;
  }
  /* Save var methods */
  setList3Details21(data: any) {
  
    let wiData = [];
    let spData = [];

    let itemObj = {};
    if ( this.sharedService?.sharedData?.AssetExpandableList) {
      if (
        this.sharedService?.sharedData?.breadcrumbAssetSelection &&
        this.sharedService?.sharedData?.breadcrumbAssetSelectionfailureModeObj &&
        this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.data &&
        this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.data.grandChildId
      ) {
        let fnId = this.sharedService?.sharedData?.breadcrumbAssetSelection.functionId;
        let fnFailureId = this.sharedService?.sharedData?.breadcrumbAssetSelection.functionalFailureId;
        let failureModeId = this.sharedService?.sharedData?.breadcrumbAssetSelection.failureModeObj.data.grandChildId;
        let taskId = this.sharedService?.sharedData?.breadcrumbAssetSelection.taskId;
        let fnObj =  this.sharedService?.sharedData?.AssetExpandableList.Function.filter((item) => item.Id === fnId);
        let fnFailureObj =  this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures.filter(
          (item) => item.childId === fnFailureId
        );
        let failureModeObj =  this.sharedService?.sharedData?.AssetExpandableList.FailureModes.filter(
          (item) => item.grandChildId === failureModeId
        );
        let taskObj =  this.sharedService?.sharedData?.AssetExpandableList.Action.filter(
          (item) => item.greatGrandChildId === taskId
        );
        failureModeObj[0].ScheduledTasks.map((st) => {
          st.WorkInstructions.map((wi) => {
            wiData.push(wi);
          });
          st.Spares.map((sp) => {
            spData.push(sp);
          });
        });
        failureModeObj[0].CorrectiveTasks.map((ct) => {
          ct.WorkInstructions.map((wi) => {
            wiData.push(wi);
          });
          ct.Spares.map((sp) => {
            spData.push(sp);
          });
        });
        itemObj = {
          greatGrandParentId: failureModeObj[0].grandChildId,
          greatGrandChildId: taskObj[0].greatGrandChildId,
          Name: taskObj[0].Name,
          Description: taskObj[0].Description,
          Duration: taskObj[0].Duration,
          Type: taskObj[0].Type,
          OperationNumber: taskObj[0].OperationNumber,
          MaintenanceTypeName: taskObj[0].MaintenanceTypeName,
          Interval: taskObj[0].Interval,
          RampTime: taskObj[0].RampTime,
          ExternalOperationalCost: taskObj[0].ExternalOperationalCost,
          Offset: taskObj[0].Offset,
          taskId: taskObj[0].greatGrandChildId,
          IsEnabled: taskObj[0].IsEnabled,
          IsMandatory: taskObj[0].IsMandatory,
          IsFixedInterval: taskObj[0].IsFixedInterval,
          IsSecondaryAction: taskObj[0].IsSecondaryAction,
          IsOutedDuringMaintenance: taskObj[0].IsOutedDuringMaintenance,
          PfCurve: taskObj[0].PfCurve,
          DetestionProbability: taskObj[0].DetectionProbability,
          PfInterval: taskObj[0].PfInterval,
          PfStandardDeviation: taskObj[0].PfStandardDeviation,
          Function: fnObj[0].value,
          FunctionalFailure: fnFailureObj[0].value,
          FailureMode: failureModeObj[0].Description,
          Labors: taskObj[0].Labors,
          WorkInstructions: wiData,
          Spares: spData,
          taskType: taskObj[0].MaintenanceTypeName ? taskObj[0].MaintenanceTypeName : 'CT',
          optimzationInterval: taskObj[0].optimzationInterval,
        };
      } else {
        if (
           this.sharedService?.sharedData?.AssetExpandableList.FailureModes &&
           this.sharedService?.sharedData?.AssetExpandableList.FailureModes.length > 0
        ) {
          if (
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks &&
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks.length > 0
          ) {
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks.map((st) => {
              st.WorkInstructions.map((wi) => {
                wiData.push(wi);
              });
              st.Spares.map((sp) => {
                spData.push(sp);
              });
            });
          }
          if (
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].CorrectiveTasks &&
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].CorrectiveTasks.length > 0
          ) {
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].CorrectiveTasks.map((ct) => {
              ct.WorkInstructions.map((wi) => {
                wiData.push(wi);
              });
              ct.Spares.map((sp) => {
                spData.push(sp);
              });
            });
          }
          if (
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks &&
             this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks.length > 0
          ) {
            itemObj = {
              greatGrandParentId:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].grandChildId,
              greatGrandChildId:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Id,
              Name:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Name,
              Description:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Description,
              Duration:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Duration,
              Type:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Type,
              OperationNumber:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].OperationNumber,
              MaintenanceTypeName:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].MaintenanceTypeName,
              Interval:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Interval,
              RampTime:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].RampTime,
              ExternalOperationalCost:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0]
                  .ExternalOperationalCost,
              Offset:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Offset,
              IsEnabled:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].IsEnabled,
              IsMandatory:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].IsMandatory,
              IsFixedInterval:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].IsFixedInterval,
              IsSecondaryAction:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].IsSecondaryAction,
              IsOutedDuringMaintenance:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0]
                  .IsOutedDuringMaintenance,
              PfCurve:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].PfCurve,
              DetestionProbability:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0]
                  .DetectionProbability,
              PfInterval:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].PfInterval,
              PfStandardDeviation:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].PfStandardDeviation,
              Function:  this.sharedService?.sharedData?.AssetExpandableList.Function[0].value,
              FunctionalFailure:  this.sharedService?.sharedData?.AssetExpandableList.FunctionalFailures[0].value,
              FailureMode:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].Description,
              Labors:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Labors,
              taskId:  this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Id,
              WorkInstructions: wiData,
              Spares: spData,
              taskType: 'SC',
              optimzationInterval:
                 this.sharedService?.sharedData?.AssetExpandableList.FailureModes[0].ScheduledTasks[0].Optimization,
            };
          }
        }
      }
    }
    return itemObj;
  }


  /* Dynamic routing generation */
  DynamicRouting(data: any) {
    const appState: any = this.appState;
    const pages = pageRouteData.pageRouteDetails;
    try {
      let pageId;
      let mappingParams = [];
      if ((window as any).parent.clearContextArray) {
        (window as any).parent.clearContextArray(false, ['breadcrumbAssetSelection'],);
      }

      if (
        ((this.sharedService?.sharedData === undefined ||
          this.sharedService?.sharedData?.assetstrategieslistTable === undefined ||
          this.sharedService?.sharedData === null ||
          this.sharedService?.sharedData?.assetstrategieslistTable === null) &&
          (this.sharedService?.sharedData === undefined ||
            this.sharedService?.sharedData?.AssetExpandableList === undefined ||
            this.sharedService?.sharedData === null ||
            this.sharedService?.sharedData?.AssetExpandableList === null)) ||
        (this.sharedService?.sharedData?.AssetExpandableListErr && this.sharedService?.sharedData.assetstrategieslistTableErr)
      ) {
        pageId = pages.find((item) => item.name == 'error').id;
        if (this.sharedService?.sharedData?.AssetExpandableListErr && this.sharedService?.sharedData?.assetstrategieslistTableErr) {
          let errInfoAssetExpandableListErr = this.sharedService?.sharedData?.AssetExpandableListErr;

          let errCode = errInfoAssetExpandableListErr.status; 
          let errMessage = errInfoAssetExpandableListErr.statusText; 

          mappingParams = [
            {
              key: 'errorInfo',
              type: 'value',
              value: {
                code: '',
                description: errMessage,
                title: `${this.i18NextService.t('errorWithCode')} ${errCode}! `,
                subTitle: `${this.i18NextService.t('encounteredError')}`,
                ctaLabel: `${this.i18NextService.t('backHome')}`,
              },
            },
          ];
        } else {
          mappingParams = [
            {
              key: 'errorInfo',
              type: 'value',
              value: {
                code: '',
                description: `${this.i18NextService.t('errorMessage')}`,
                title: `${this.i18NextService.t('error')} `,
                subTitle: `${this.i18NextService.t('encounteredError')}`,
                ctaLabel: `${this.i18NextService.t('backHome')}`,
              },
            },
          ];
        }

        const navigation = {
          pageID: pageId,
          mappingParams: mappingParams,
        };
        return navigation;
      } else {
      }
    } catch (error) {
      console.error('Error in method dynamicRouteChanges', error.message);
    }
  }
  

  /*  OUTPUT EVENTS of widgets - Label */
  /* Label of bhEventAppendedEmitter */
  labelModelBhEventAppendedEmitter(data: any) {
    const widgetEventData = data;
    let selectedRoute: any = this.bhEventAppendedEmitterlabelModelDynamicRouting(data);
    this.dynamicRouteMapping(selectedRoute, widgetEventData);
    if (!this.configDetail.cordantApp){
      localStorage.setItem("fromStrategyTab","true");
    }
  }
  /* Dynamic routing generation */
  bhEventAppendedEmitterlabelModelDynamicRouting(data: any) {
    const widgetEventData = data;
    const pages = pageRouteData.pageRouteDetails;
    try {
      /* Sample code format to use for dynamic Navigation.
Determine id of the page (where you want to navigate) using "pages" array of the application object 
then pass the id using the key "pageID" under navigation object.
You can also pass values to your navigation object in the given format using the key "mappingParams" array. */
      if (widgetEventData.target.innerText === 'Risk Visibility') {
        let pageId;
        let mappingParams;
        if (widgetEventData.target.innerText === 'Risk Visibility') {
          pageId = pages.find((item) => item.name == 'home').id;
        } else {
          pageId = pages.find((item) => item.name == 'Strategy').id;
        }

        mappingParams = [];
        const navigation = {
          pageID: pageId,
          mappingParams: mappingParams,
        };
        return navigation;
      }
    } catch (error) {
      console.error('Error in method dynamicRouteChanges', error.message);
    }
  }
  
  card1ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card1ModelOnWidgetLoad(data: any) {
    let keys = [];
  }

  
  card2ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card2ModelOnWidgetLoad(data: any) {
    let keys = [];
  }

  
  /*  OUTPUT EVENTS of widgets - Button Tab */
  /* Button Tab of selected */
  buttonTab3ModelSelected(data: any) {
    let keys = [];
    /* variable for event =  activeKeySet */
    this.activeKeySet = this.selectedButtonTab3Model(data);
    keys.push('activeKeySet');
    this.nestedPageState = { ...this.nestedPageState, ...{ activeKeySet: this.activeKeySet }, keys };
    this.setConfiguredData('activeKeySet');

    /* variable for event =  selectedFunctionalFailureTab */
    this.selectedFunctionalFailureTab = this.selectedButtonTab3Model1(data);
    keys.push('selectedFunctionalFailureTab');
    this.nestedPageState = {
      ...this.nestedPageState,
      ...{ selectedFunctionalFailureTab: this.selectedFunctionalFailureTab },
      keys,
    };
    this.setConfiguredData('selectedFunctionalFailureTab');

    /* variable for event =  selectedFunctionTab */
    this.selectedFunctionTab = this.selectedButtonTab3Model2(data);
    keys.push('selectedFunctionTab');
    this.nestedPageState = { ...this.nestedPageState, ...{ selectedFunctionTab: this.selectedFunctionTab }, keys };
    this.setConfiguredData('selectedFunctionTab');

    /* variable for event =  selectedFailureModeTab */
    this.selectedFailureModeTab = this.selectedButtonTab3Model3(data);
    keys.push('selectedFailureModeTab');
    this.nestedPageState = {
      ...this.nestedPageState,
      ...{ selectedFailureModeTab: this.selectedFailureModeTab },
      keys,
    };
    this.setConfiguredData('selectedFailureModeTab');

    /* variable for event =  selectedActionTab */
    this.selectedActionTab = this.selectedButtonTab3Model4(data);
    keys.push('selectedActionTab');
    this.nestedPageState = { ...this.nestedPageState, ...{ selectedActionTab: this.selectedActionTab }, keys };
    this.setConfiguredData('selectedActionTab');
  }
  /* Save Var changes for selected */
  selectedButtonTab3Model(data: any) {
    /* data */
    return data.key;
  }
  /* Save Var changes for selected */
  selectedButtonTab3Model1(data: any) {
    /* data */
    let indexOfTabSelected = false;
    if (this.tabMenu && this.tabMenu.length > 0) {
      this.tabMenu.forEach((item) => {
        if (item.key === 'functionFailureTab') {
          indexOfTabSelected = true;
        }
      });
    }
    if (data.key === 'functionFailureTab' && indexOfTabSelected) {
      return true;
    }
    return false;
  }
  /* Save Var changes for selected */
  selectedButtonTab3Model2(data: any) {
    /* data */
    let indexOfTabSelected = false;
    if (this.tabMenu && this.tabMenu.length > 0) {
      this.tabMenu.forEach((item) => {
        if (item.key === 'functionTab') {
          indexOfTabSelected = true;
        }
      });
    }
    if (data.key === 'functionTab' && indexOfTabSelected) {
      return true;
    }

    return false;
  }
  /* Save Var changes for selected */
  selectedButtonTab3Model3(data: any) {
    /* data */
    let indexOfTabSelected = false;
    if (this.tabMenu && this.tabMenu.length > 0) {
      this.tabMenu.forEach((item) => {
        if (item.key === 'functionFailureModeTab') {
          indexOfTabSelected = true;
        }
      });
    }
    if (data.key === 'functionFailureModeTab' && indexOfTabSelected) {
      return true;
    }

    return false;
  }
  /* Save Var changes for selected */
  selectedButtonTab3Model4(data: any) {
    /* data */
    let indexOfTabSelected = false;
    if (this.tabMenu && this.tabMenu.length > 0) {
      this.tabMenu.forEach((item) => {
        if (item.key === 'actionsTab') {
          indexOfTabSelected = true;
        }
      });
    }
    if (data.key === 'actionsTab' && indexOfTabSelected) {
      return true;
    }

    return false;
  }
  
  card4ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card4ModelOnWidgetLoad(data: any) {
    let keys = [];
  }
  card5ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card5ModelOnWidgetLoad(data: any) {
    let keys = [];
  }
  card6ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card6ModelOnWidgetLoad(data: any) {
    let keys = [];
  }
  card7ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card7ModelOnWidgetLoad(data: any) {
    let keys = [];
  }
  card8ModelOnFormStatusChange(data: any) {
    let keys = [];
  }
  card8ModelOnWidgetLoad(data: any) {
    let keys = [];
  }

  
  
  /* set widget extra config data */
  setConfiguredData(state = null) {
    this.card2Model.visibility = true;
    this.buttonTab3Model.items = this.setButtonTab3Modelitems();
    this.buttonTab3Model.activeKey = this.activeKeySet;
    let isVisible = false;
    if (this.selectedStrategyFrameworkTab && this.selectedFunctionTab) {
      isVisible = true;
    }
    this.card4Model.visibility = isVisible;
    this.card5Model.visibility = this.setCard5Modelvisibility();
    this.setcard6ModelData(state);
    this.setcard7ModelData(state);
    this.setcard8ModelData(state);
  }



  setcard6ModelData(state = null) {
    let stateVariables = [];
    if (state === null) {
      const setCard6ModelcustomCSS = this.setCard6ModelcustomCSS();
      if (setCard6ModelcustomCSS !== undefined) {
        this.card6Model.customCSS = setCard6ModelcustomCSS;
      }
    }
    stateVariables = ['selectedStrategyFrameworkTab', 'selectedFailureModeTab'];
    if (state === null || stateVariables.indexOf(state) > -1) {
      const setCard6Modelvisibility = this.setCard6Modelvisibility();
      if (setCard6Modelvisibility !== undefined) {
        this.card6Model.visibility = setCard6Modelvisibility;
      }
    }
  }

  setcard7ModelData(state = null) {
    const data = this.dataStore; //NOSONAR
    let stateVariables = [];
    stateVariables = ['selectedStrategyFrameworkTab', 'selectedActionTab', 'TaskType'];
    if (state === null || stateVariables.indexOf(state) > -1) {
      const setCard7Modelvisibility = this.setCard7Modelvisibility();
      if (setCard7Modelvisibility !== undefined) {
        this.card7Model.visibility = setCard7Modelvisibility;
      }
    }
  }

  setcard8ModelData(state = null) {
    const data = this.dataStore; //NOSONAR
    let stateVariables = [];
    stateVariables = ['selectedStrategyFrameworkTab', 'selectedActionTab', 'TaskType'];
    if (state === null || stateVariables.indexOf(state) > -1) {
      const setCard8Modelvisibility = this.setCard8Modelvisibility();
      if (setCard8Modelvisibility !== undefined) {
        this.card8Model.visibility = setCard8Modelvisibility;
      }
    }
  }

  


  /* extra configuration event of widget items and controlid buttonTab3Model */
  setButtonTab3Modelitems() {
    try {
      return [
        {
          label: this.i18NextService.t('strategyTab.functionTab.tabName'),
          key: 'functionTab',
        },
        {
          label: this.i18NextService.t('strategyTab.functionalFailureTab.tabName'),
          key: 'functionFailureTab',
        },
        {
          label: this.i18NextService.t('strategyTab.failureModeTab.tabName'),
          key: 'functionFailureModeTab',
        },
        {
          label: this.i18NextService.t('strategyTab.taskTab.tabName'),
          key: 'actionsTab',
        },
      ];
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
  /* extra configuration event of widget activeKey and controlid buttonTab3Model */
  setButtonTab3ModelactiveKey() {
    try {
      return this.activeKeySet;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
 
  /* extra configuration event of widget visibility and controlid card4Model */
  setCard4Modelvisibility() {
    try {
      let isVisible = false;
      if (this.selectedStrategyFrameworkTab && this.selectedFunctionTab) {
        isVisible = true;
      }

      return isVisible;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
  /* extra configuration event of widget visibility and controlid card5Model */
  setCard5Modelvisibility() {
    try {
      let isVisible = false;
      if (this.selectedStrategyFrameworkTab && this.selectedFunctionalFailureTab) {
        isVisible = true;
      }
      return isVisible;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
  /* extra configuration event of widget customCSS and controlid card6Model */
  setCard6ModelcustomCSS() {
    try {
      /* dataset */
      return;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
  /* extra configuration event of widget visibility and controlid card6Model */
  setCard6Modelvisibility() {
    try {
      let isVisible = false;
      if (this.selectedStrategyFrameworkTab && this.selectedFailureModeTab) {
        isVisible = true;
      }
      return isVisible;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
  /* extra configuration event of widget visibility and controlid card7Model */
  setCard7Modelvisibility() {
    try {
      let isVisible = false;
      if (this.selectedStrategyFrameworkTab && this.selectedActionTab && this.TaskType === 'SC') {
        isVisible = true;
      }
      return isVisible;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
  /* extra configuration event of widget visibility and controlid card8Model */
  setCard8Modelvisibility() {
    try {
      let isVisible = false;
      if (this.selectedStrategyFrameworkTab && this.selectedActionTab && this.TaskType === 'CR') {
        isVisible = true;
      }
      return isVisible;
    } catch (e) {
      /* istanbul ignore next */
      return;
    }
  }
 
  /* dynamic route mapping */
  /* istanbul ignore next */
  dynamicRouteMapping(selectedRoute, widgetEventData) {
    const masterPageState: any = this.masterPageState;
    const pages = pageRouteData.pageRouteDetails;
    let currentPage: any = null;
    if (selectedRoute && selectedRoute.pageID) {
      currentPage = pages.filter((page) => page.id === selectedRoute.pageID);
    }
    if (selectedRoute && selectedRoute.mappingParams && selectedRoute.mappingParams.length > 0) {
      const stateData = {
        masterPageState: masterPageState,
        widgetEventData: widgetEventData,
      };
      this.sharedService.dynamicRouteMapping(selectedRoute, stateData);
    }
    if (currentPage && currentPage.length > 0 && currentPage[0].pageType.toLowerCase() === 'page') {
      this.router.navigate(['/' + currentPage[0].routeUrl]);
    }
  }
  /*generating row events */
  row4237148789() {
    return this.isLoadingInitiated ? true : false;
  }
  /* Show hide cards based on physicalasset startegy data */
  showHideStrategyCards() {
    return !this.sharedService?.sharedData?.AssetExpandableListErr;
  }
  ngOnDestroy() {
    this.subList.unsubscribe();
  }
}
