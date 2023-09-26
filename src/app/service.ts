import { inject, injectable } from "inversify";
import logger from '../logger';
import TYPES from "../types";
import { AgServiceBodyContributorsFilter, Constant, Months, RiskHistoryMappingIgnoreFields, RiskOrders } from "../utils/constants";
import { ApiService } from "./api_service";
import { CacheService } from "./cache-service";
import { TokenService } from "./token-service";
import { ErrorCodes } from "../exceptions/error-codes";
import { FacadeError } from "../exceptions/facade-error";
import {
    assetNodeFetchUrl, assetNodesSearchURL,
    assetsNodesHierarchyURL,
    kpiBulkURL,
    kpiURIs,
    riskValueURL,
    topContributorsURL,
    trendCountURL
} from '../utils/url-config';
import { QueueService } from "./queue.service";

import { isEmpty, orderBy } from 'lodash';
import { HttpCodes } from "../exceptions/http-codes";
/* istanbul ignore next */
const TENANT_INFO = process.env.TENANT_INFO ? JSON.parse(process.env.TENANT_INFO) : require("../../localConfig.json");
/* istanbul ignore next */
let CACHED_TIME_TO_LIVE = process.env.CACHED_TIME_TO_LIVE ? process.env.CACHED_TIME_TO_LIVE : TENANT_INFO.CACHED_TIME_TO_LIVE;

const q = new Set();

let auth: string;
let kpiAuth: string;
let kpiUrl: string;
let onePmBaseUrl: string;
let assetBaseUrl: string;
let nodeFetchUrl: string;
let hierarchyLevel: number;

@injectable()
export class AssetRiskService {

    constructor(
        @inject(TYPES.ApiService) private apiService: ApiService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.CacheService) private cacheService: CacheService,
        @inject(TYPES.QueueService) private queueService: QueueService
    ) {
        this.initConfig();
        this.initEventListener();
        this.queueEventListener();
    }

    /*
        Purpose - Move all constructor configuration in a new method
        Method : initConfig
    */
    private initConfig() {
        try {
            auth = TENANT_INFO.Authorization;
            kpiAuth = TENANT_INFO.KPIAuthorization;
            kpiUrl = TENANT_INFO.kpiUrl;
            onePmBaseUrl = TENANT_INFO.onePmBaseUrl;
            assetBaseUrl = TENANT_INFO.assetBaseUrl;
            nodeFetchUrl = TENANT_INFO.nodeFetchUrl;
            hierarchyLevel = TENANT_INFO.hierarchyLevel;
        }
        catch (e) {
            logger.error(`AssetRiskService , Error in INIT`);
        }
    }

    /*
        Purpose - move listener functionalities from constructor and created a new methods
        Method : initEventListener
    */
    private initEventListener(){
        try {
            logger.debug(`AssetRiskService redisClient cacheService status :` + this.cacheService.getStatus());
            this.cacheService.eventEmitter.on('preload', () => {
                logger.debug(`Event Emitter Events  from cacheService `);
                this.getPreloadddata();
            })
            logger.debug(`AssetRiskService redisClient cacheService status :` + this.cacheService.getStatus()); 
        }
        catch (e) {
            logger.error(`AssetRiskService, Error in initEventListener`);
        }
    }

    /*
        Purpose - move listener functionalities from constructor and created a new methods
        Method : initEventListener
    */
    private queueEventListener(){
        try {
            this.queueService.eventEmitter.on('assetId', (assetObj: any) => {
                try {
                    logger.debug(`assetId :` + assetObj);
                    const assetDetails = assetObj.split("::::");
                    logger.debug(`assetDetails :` + assetDetails);
                    this.serveAssetData(assetDetails, assetObj);
                }
                catch (e) {
                    logger.debug(`assetDetails : error`);
                    this.queueService.deleteFromQueue(assetObj);
                }
            })
        }
        catch (e) {
            logger.error(`AssetRiskService, Error in queueEventListener`);
           
        }
    }

    private async serveAssetData(assetDetails: any, assetObj: any) {
        try {
            await this.queueService.setInProcess(true);

            logger.debug('***********************************', assetDetails[5], assetDetails[5] === 'true')

            await this.assetRiskDetails(assetDetails[0], assetDetails[5] === 'true', JSON.parse(assetDetails[1]), JSON.parse(assetDetails[2]), JSON.parse(assetDetails[3]), assetDetails[4], assetDetails[6], false);
            await this.queueService.deleteFromQueue(assetObj);
        }
        catch (e) {
            logger.error(`Error in HIT Aset API: ${assetObj}`);
            await this.queueService.deleteFromQueue(assetObj);
        }
    }

    /**
     *
     * @param assetId 
     * @returns 
    */
    public async totalRisk(assetId: string, forceFetch: boolean, tenantid: string, groupType: string) {
        logger.debug(`totalRisk: IN SERVICE onePmBaseUrl is :` + onePmBaseUrl);
        logger.debug(`totalRisk: IN SERVICE kpiUrl is :` + kpiUrl);
        logger.debug(`totalRisk AssetRiskService redisClient cacheService status :` + this.cacheService.getStatus());
        let agserviceResponse: any = {}
        agserviceResponse = await this.getTotalRiskValues(assetId, forceFetch, agserviceResponse, tenantid, groupType);
        return agserviceResponse;
    }

    public async cacheCrud(body: any) {
        switch (body.action.toLowerCase()) {
            case 'add':
                this.cacheService.setCacheData(body.key, body.ttl, body.value);
                break;
            case 'update':
                if (!body.value) {
                    this.cacheService.setCacheDataTtl(body.key, body.ttl);
                } else {
                    this.cacheService.setCacheData(body.key, body.ttl, body.value);
                }
                break;
            case 'delete':
                this.cacheService.deleteCacheDataByKey(body.key);
                break;
            case 'clearall':
                this.cacheService.deleteAllKeys();
                break;
        }
    }

    /**
     * 
     * @param assetId 
     * @param timeHistoryFilter 
     * @returns 
     */
    public async totalRiskHistory(assetId: string, forceFetch: boolean, timeHistoryFilter: any, tenantId: string, contributorFilter: any, groupType: string) {
        let agserviceResponse: any = {}
        /** fetching totalRisk and riskHistory except conditional risk history */
        agserviceResponse = await this.getTotalRiskHistoryValues(assetId, forceFetch, agserviceResponse, timeHistoryFilter, tenantId, contributorFilter.riskType, groupType);

        return agserviceResponse;
    }

    /**
     * 
     * @param assetId 
     * @param riskType 
     * @param groupByType 
     * @param contributorType
     * @returns 
     */
    public async topContributors(assetId: string, forceFetch: boolean, riskType: string, contributorType: any, tenantId: string) {
        logger.debug(`topContributors AssetRiskService redisClient cacheService status :` + this.cacheService.getStatus());
        let agserviceResponse: any = {}
        let contributorsList: any = [];
        switch (riskType.toLowerCase()) {
            case "maintainence":
            case "defect":
            case "strategy":
            case "total":
                for (const type of contributorType) {
                    let contributors = await this.getContributorList(type, assetId, forceFetch, riskType, tenantId, null);
                    contributorsList.push(contributors);
                }
                break;
            case "condition":
                let conditionalTopContributors = await this.getConditionalTopContributors(assetId, forceFetch, riskType, tenantId);
                contributorsList.push(conditionalTopContributors);
                break;
        }
        if (riskType.toLowerCase() === "total") {
            let conditionalTopContributor = await this.getConditionalTopContributors(assetId, forceFetch, riskType, tenantId);
            contributorsList.push(conditionalTopContributor);
        }
        agserviceResponse.TopContributors = { "errorStatusCode": "", "data": contributorsList };
        return agserviceResponse;
    }

    public async checkAllCache(kpis: any, tenantid: any, assetId: any, startTime: any, endTime: any, contributorsFilter: any, groupType: string | null) {
        const ahmAssetId = groupType?.toLowerCase() === 'fleet' ? 'fleet' : assetId;
        let isAllDataInCache = 0;
        if (this.cacheService.getStatus() == true) {
            const mapKeyGetTrendCount = `{${Constant.CONDITIONRISKHISTORY}}:{${tenantid}}:{${ahmAssetId}}:{${startTime}}:{${endTime}}:{${Constant.TRENDCOUNT}}`
            const mapKeyGetRiskValues = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.OTHERRISK}`
            const mapKeygetConditionalTopContributors = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.CONDITIONRISKTOPCONTRIBUTORS}`
            const mapKeyGetConditionalTotalRisk = `${Constant.RISKSERVICE}:{${tenantid}}:{${ahmAssetId}}:${Constant.TOTALCONDITIONRISK}`
            const mapKeygetTopContributorsForCondition = `${Constant.RISKSERVICE}:{${tenantid}}:{${ahmAssetId}}:${Constant.TOPCONTRIBUTORSFORCONDITION}`


            for (var kpiValue of kpis) {
                if (kpiValue.toLowerCase() === 'totalrisk') {
                    const res = await this.cacheService.getCacheData(mapKeyGetConditionalTotalRisk);
                    //logger.debug('totalrisk::::' + res + "::::" + mapKeyGetConditionalTotalRisk);
                    if (!isEmpty(res)) {
                        isAllDataInCache += 1;
                    }
                }
                if (kpiValue.toLowerCase() === 'totalriskhistory') {
                    const res = await this.cacheService.getCacheData(mapKeyGetTrendCount);
                    //logger.debug('totalriskhistory::::' + res + "::::" + mapKeyGetTrendCount);
                    if (!isEmpty(res)) {
                        isAllDataInCache += 1;
                    }
                }
                if (kpiValue.toLowerCase() === 'totalcontributors') {
                    if (contributorsFilter.riskType.toLowerCase() === "condition") {
                        const res = await this.cacheService.getCacheData(mapKeygetTopContributorsForCondition);
                        //logger.debug('totalcontributors::::condition' + res + "::::" + mapKeygetTopContributorsForCondition);
                        if (!isEmpty(res)) {
                            isAllDataInCache += 1;
                        }

                    } else if (contributorsFilter.riskType.toLowerCase() === "total") {
                        const res = await this.cacheService.getCacheData(mapKeygetConditionalTopContributors);
                        // logger.debug('totalcontributors::::total' + res + "::::" + mapKeygetConditionalTopContributors);
                        if (!isEmpty(res)) {
                            isAllDataInCache += 1;
                        }
                    } else {
                        const res = await this.cacheService.getCacheData(mapKeyGetRiskValues);
                        // logger.debug('totalcontributors::::other' + res + "::::" + mapKeyGetRiskValues);
                        if (!isEmpty(res)) {
                            isAllDataInCache += 1;
                        }
                    }
                }
            }

            return isAllDataInCache;
        }
    }

    /**
     * 
     * @param assetId 
     * @param timeHistoryFilter 
     * @param kpiFilter 
     * @param groupByType 
     * @param contributorFilter 
     * @param req 
     * @returns 
     */
    public async getPreloadddata(body?: any) {
        try {
            //---------[ preload body ]---------
            const startEndTime = this.queueService.getStartEndTime();
            const timeHistoryFilter = {
                "groupBy": "month",
                "intervalCount": 12,
                "startTime": startEndTime.startDate,
                "endTime": startEndTime.endDate
            };
            const kpiFilter = [
                "TotalRisk",
                "TotalRiskHistory",
                "TotalContributors"
            ];
            //var tenantid = 'dedicated';
            var tenantid = TENANT_INFO.TENANT_ID;
            var forceFetch = false;
            //-----------------------------------
            //---------getting token 
            //this.getkeyCloakToken();
            //if (process.env.TENANT_INFO != undefined) {
            // var authToken: any;
            await this.tokenService.setkeyCloakToken();
            setInterval(() => {
                this.tokenService.setkeyCloakToken();
            }, 120000)
            //auth = JSON.parse(authToken);
            //auth = JSON.stringify(authToken);
            //kpiAuth = JSON.stringify(authToken);

            //this.tokenService.setToken(authToken);
            //}
            //--------------
            let assetIdArray: any;
            logger.debug(`getPreloadddata AssetRiskService redisClient cacheService status :` + this.cacheService.getStatus());
            if (this.cacheService.getStatus() == true) {

                const asset = await this.fetchCmmsEnterprise();
                const fetchAssetId = asset.id;
                /********[ storing optimizedHierarchy data in cache ]******* */
                //var mapKeyOptimizedHierarchy = `preload:{${tenantid}}:{${assetId}}:optimizedHierarchy`
                var mapKeyOptimizedHierarchy = `${Constant.PRELOAD}:{${tenantid}}:{${fetchAssetId}}:${Constant.OPTIMIZEDHIERARCHY}`
                var getPreloadCacheddata = null;
                if (getPreloadCacheddata !== null) {
                    assetIdArray = JSON.parse(getPreloadCacheddata);
                    logger.debug("[ getPreloadddata AssetRiskService getPreloadCacheddata Response from Cache Cacheddata cachedKey:" + mapKeyOptimizedHierarchy + "]");
                }
                else {
                    if (fetchAssetId !== null && fetchAssetId !== undefined && fetchAssetId !== "") {
                        assetIdArray = await this.optimizedHierarchy(fetchAssetId, body);
                        if (assetIdArray != null && assetIdArray !== undefined && assetIdArray?.length > 0) {
                            this.cacheService.setCacheData(mapKeyOptimizedHierarchy, CACHED_TIME_TO_LIVE, JSON.stringify(assetIdArray));
                        }
                        logger.debug("assetIdArray: ", assetIdArray.length)
                        logger.debug("[ getPreloadddata AssetRiskService getPreloadCacheddata Stored CatchedData succss for cachedKey: " + mapKeyOptimizedHierarchy + "  ]");
                    }
                }
            } else {
                logger.error(`getPreloadddata AssetRiskService redisClient NOT CONNECT, cacheService status :` + this.cacheService.getStatus());
            }

            if (assetIdArray !== null && assetIdArray !== undefined && assetIdArray?.length > 0) {
                for (let optimizedHierarchyAssetId of assetIdArray) {
                    try {
                        let isAllDataInCache: any;
                        isAllDataInCache = await this.checkAllCache(kpiFilter, tenantid, optimizedHierarchyAssetId, timeHistoryFilter.startTime, timeHistoryFilter.endTime, AgServiceBodyContributorsFilter.total, null);
                        if (isAllDataInCache !== kpiFilter?.length) {
                            await this.queueService.addToQueue(`${optimizedHierarchyAssetId}::::${JSON.stringify(timeHistoryFilter)}::::${JSON.stringify(kpiFilter)}::::${JSON.stringify(AgServiceBodyContributorsFilter.total)}::::${tenantid}::::false::::null`);
                        }
                        if (isAllDataInCache !== kpiFilter?.length) {
                            await this.queueService.addToQueue(`${optimizedHierarchyAssetId}::::${JSON.stringify(timeHistoryFilter)}::::${JSON.stringify(kpiFilter)}::::${JSON.stringify(AgServiceBodyContributorsFilter.condition)}::::${tenantid}::::false::::null`);
                        }
                        if (isAllDataInCache !== kpiFilter?.length) {
                            await this.queueService.addToQueue(`${optimizedHierarchyAssetId}::::${JSON.stringify(timeHistoryFilter)}::::${JSON.stringify(kpiFilter)}::::${JSON.stringify(AgServiceBodyContributorsFilter.strategy)}::::${tenantid}::::false::::null`);
                        }

                        if (isAllDataInCache !== kpiFilter?.length) {
                            await this.queueService.addToQueue(`${optimizedHierarchyAssetId}::::${JSON.stringify(timeHistoryFilter)}::::${JSON.stringify(kpiFilter)}::::${JSON.stringify(AgServiceBodyContributorsFilter.maintainence)}::::${tenantid}::::false::::null`);
                        }

                        if (isAllDataInCache !== kpiFilter?.length) {
                            await this.queueService.addToQueue(`${optimizedHierarchyAssetId}::::${JSON.stringify(timeHistoryFilter)}::::${JSON.stringify(kpiFilter)}::::${JSON.stringify(AgServiceBodyContributorsFilter.defect)}::::${tenantid}::::false::::null`);
                        }
                    } catch (error: any) {
                        logger.error("error in AssetRiskService getTotalAssetRiskDetails from  optimizedHierarchyAssetId ", error);
                    }
                }
                const inprocess = await this.queueService.getInProcess();
                logger.debug("inprocess::::" + inprocess);
                if (!inprocess && assetIdArray?.length) {
                    this.queueService.emitEvent(`${assetIdArray[0]}::::${JSON.stringify(timeHistoryFilter)}::::${JSON.stringify(kpiFilter)}::::${JSON.stringify(AgServiceBodyContributorsFilter.total)}::::${tenantid}::::false::::null`);
                }
            }
        } catch (error: any) {
            logger.error("error in AssetRiskService getPreloadddata : ", error);
        }
    }

    /**
     * GET assetRiskDetails
     * @param assetId 
     * @param timeHistoryFilter 
     * @param kpiFilter 
     * @param groupByType 
     * @param contributorFilter 
     * @param req 
     * @returns 
     */
    public async assetRiskDetails(assetId: string, forceFetch: boolean, timeHistoryFilter: any, kpiFilter: any, contributorFilter: any, tenantid: string, groupType: string, throwError: boolean = true) {
        let agserviceResponse: any = {};
        agserviceResponse.TopContributors = {};
        agserviceResponse.TopContributors.data = [];
        agserviceResponse.TopContributors.errorStatusCode = "";
        let assetIdArray: any = [];
        logger.debug(`assetRiskDetails AssetRiskService redisClient cacheService status :` + this.cacheService.getStatus());
        try {

            if (kpiFilter != null || kpiFilter != undefined) {
                var contributorsList: any = [];
                logger.debug('assetIds', assetId)
                for (var kpiValue of kpiFilter) {
                    if (kpiValue.toLowerCase() === 'totalrisk') {
                        agserviceResponse = await this.getTotalRiskValues(assetId, forceFetch, agserviceResponse, tenantid, groupType);
                    }
                    if (kpiValue.toLowerCase() === 'totalriskhistory') {
                        /** fetching totalRisk and riskHistory except conditional risk history */

                        agserviceResponse = await this.getTotalRiskHistoryValues(assetId, forceFetch, agserviceResponse, timeHistoryFilter, tenantid, contributorFilter.riskType, groupType);


                    }
                    if (kpiValue.toLowerCase() === 'totalcontributors') {
                        if (contributorFilter !== undefined) {
                            var contributorArray: any = [];
                            if (TENANT_INFO.cordantApp === false && contributorFilter.riskType.toLowerCase() === "total") {
                                logger.debug("in contributorFilter riskType total for getConditionalTopContributors assetId: " + assetId)
                                var conditionalTopContributors = await this.getConditionalTopContributors(assetId, forceFetch, contributorFilter.riskType, tenantid);
                                logger.debug('in conditionriskhistory', contributorsList);
                                if (conditionalTopContributors?.error) {
                                    agserviceResponse.TopContributors = { data: null, errorStatusCode: conditionalTopContributors?.statusCode || HttpCodes.FAILED_DEPENDENCY };
                                    return agserviceResponse;
                                }
                                // if (conditionalTopContributors === null) {
                                //     agserviceResponse.TopContributors.data = null;
                                //     agserviceResponse.TopContributors.errorStatusCode = "D001";
                                //     return agserviceResponse;
                                // }

                                if (conditionalTopContributors !== null && contributorFilter.riskType.toLowerCase() === "total") {
                                    contributorsList.push(conditionalTopContributors);
                                }

                            }
                            //conditionrisk
                            if (TENANT_INFO.cordantApp === false && contributorFilter.riskType.toLowerCase() === "condition") {
                                logger.debug("in contributorFilter riskType condition for getConditionalContributors assetId: " + assetId)
                                assetId = groupType?.toLowerCase() === 'fleet' ? 'fleet' : assetId;
                                let conditionalContributors = await this.getConditionalContributors(assetId, tenantid);

                                var obj: any = {};
                                contributorArray.ConditionalRiskContributors = conditionalContributors?.sort(function (a: any, b: any) {
                                    return (b.ContributedValue - a.ContributedValue)
                                });
                                obj.Contributors = contributorArray.ConditionalRiskContributors;
                                agserviceResponse.TopContributors.data = obj;

                                return agserviceResponse;
                            }
                            if (contributorFilter.riskType.toLowerCase() !== "condition") {

                                contributorArray = await this.getContributorList(contributorFilter.type, assetId, forceFetch, contributorFilter.riskType, tenantid, groupType);
                                //logger.debug('in totalcontributors', contributorsList)
                                if (contributorArray?.error) {
                                    agserviceResponse.TopContributors = { data: null, errorStatusCode: conditionalTopContributors?.statusCode || HttpCodes.FAILED_DEPENDENCY };
                                    return agserviceResponse;
                                }
                                if (contributorFilter.riskType.toLowerCase() == "total") {
                                    if (contributorArray?.Contributors !== null && contributorArray?.Contributors !== undefined && contributorsList[0] !== null && contributorsList[0] !== undefined && contributorArray?.Contributors?.length > 0 && contributorsList[0]?.length > 0) {
                                        const difference = [
                                            ...this.getDifferenceAB(contributorArray.Contributors, contributorsList[0]),
                                            ...this.getDifferenceBA(contributorsList[0], contributorArray.Contributors)
                                        ];
                                        //if (contributorsList.length > 0) {
                                        contributorArray["Contributors"]?.forEach((element: any) => {
                                            contributorsList[0]?.forEach((elem: any) => {
                                                if (element.PhysicalAssetId == elem.nodeId) {
                                                    element.data.push({
                                                        "Cost": elem.value,
                                                        "RiskType": "Condition",
                                                        "Value": elem.value
                                                    })
                                                    element.ContributedValue += (elem.value || 0);
                                                }
                                            });
                                        });
                                        //} 

                                        difference?.forEach(item => {
                                            if (item.nodeId) {
                                                let obj: any = {};
                                                obj.PhysicalAssetId = item.nodeId;
                                                obj.PhysicalAssetName = item.name;
                                                obj.ContributedValue = item.value;
                                                obj.PhysicalAssetDescription = item.PhysicalAssetDescription;
                                                obj.RiskType = "total";
                                                obj['data'] = this.getRiskData(item);
                                                contributorArray["Contributors"].push(obj);
                                            }
                                            else if (item.PhysicalAssetId && TENANT_INFO.cordantApp == false) {
                                                const index = contributorArray["Contributors"].findIndex((c: any) => c.PhysicalAssetId === item.PhysicalAssetId);
                                                const itemIndex = item['data'].findIndex((it: any) => it.RiskType === 'Condition');
                                                if (itemIndex === -1) {
                                                    item['data'].push(
                                                        {
                                                            "Cost": null,
                                                            "RiskType": "Condition",
                                                            "Value": null
                                                        }
                                                    )
                                                }
                                                if (index !== -1) {
                                                    contributorArray["Contributors"][index] = item;
                                                } else {
                                                    contributorArray["Contributors"].push(item);
                                                }
                                            }
                                        });
                                    }
                                    else if ((contributorArray?.Contributors == null || contributorArray?.Contributors == undefined || contributorArray?.Contributors?.length < 1) && (contributorsList[0] == null || contributorsList[0] == undefined || contributorsList[0]?.length === undefined || contributorsList[0]?.length < 1)) {
                                        contributorArray.Contributors = [];
                                    }
                                    else if (contributorArray?.Contributors == null || contributorArray?.Contributors == undefined || contributorArray?.Contributors.length < 1) {
                                        contributorArray.Contributors = [];
                                        contributorsList[0]?.forEach((item: any) => {
                                            let obj: any = {};
                                            obj.PhysicalAssetId = item.nodeId;
                                            obj.PhysicalAssetName = item.name;
                                            obj.ContributedValue = item.value;
                                            obj.PhysicalAssetDescription = item.PhysicalAssetDescription;
                                            obj.RiskType = "total";
                                            obj['data'] = this.getRiskData(item);
                                            contributorArray["Contributors"].push(obj);
                                        });

                                    }
                                }

                                const obj: any = {};
                                if (contributorArray?.Contributors != null) {
                                    contributorArray.Contributors = this.sortandslice(contributorArray.Contributors);
                                    obj.Contributors = contributorArray.Contributors;
                                }
                                if (contributorArray?.PhysicalAssetContributors != null) {
                                    contributorArray.PhysicalAssetContributors = this.sortandslice(contributorArray.PhysicalAssetContributors);
                                    obj.PhysicalAssetContributors = contributorArray.PhysicalAssetContributors;

                                }
                                if (contributorArray?.FailureModeContributors != null) {
                                    contributorArray.FailureModeContributors = this.sortandslice(contributorArray.FailureModeContributors);
                                    obj.FailureModeContributors = contributorArray.FailureModeContributors;
                                }
                                if (contributorArray?.InvestigationContributors != null) {
                                    contributorArray.InvestigationContributors = this.sortandslice(contributorArray.InvestigationContributors);
                                    obj.InvestigationContributors = contributorArray.InvestigationContributors;

                                }
                                if (contributorArray?.SystemContributors != null) {
                                    contributorArray.SystemContributors = this.sortandslice(contributorArray.SystemContributors);
                                    obj.SystemContributors = contributorArray.SystemContributors;
                                }

                                agserviceResponse.TopContributors.data = obj;

                                return agserviceResponse;
                            }

                        }
                    }
                }
            }
            return agserviceResponse;
        }

        catch (e: any) {
            logger.error('An error encountered while assetRiskDetails catch in asset risk service,  Please check the server log for further details', e);
            if (throwError) {
                throw new FacadeError(e.message, e.code, e.error);
            }

        }
    }
    async optimizedHierarchy(assetId: any, bodyObj?: any) {
        var response: any = [];
        var assetIds: any = []
        try {
            var assetNodeHierarchyURL = assetBaseUrl + assetsNodesHierarchyURL();
            logger.debug("[ Asset Risk service # optimizedHierarchy assetNodeHierarchyURL:" + assetNodeHierarchyURL);
            const body = await this.getKpiHierarchyOptions(assetId, bodyObj);
            response = await this.apiService.postReq(assetNodeHierarchyURL, body);
            if (response != null) {
                response?.data?.data?.forEach((element: any) => {
                    logger.debug(element.id + '  >>>>  ' + element.name)
                    assetIds.push(element.id);
                });
            }
            return assetIds;
        }
        catch (error: any) {
            logger.error("error in optimizedHierarchy", error)
            throw new FacadeError("Error at assetNodesSearchURL 1 (v2/assets/nodes/search?limit=1000&offset=0)", ErrorCodes.DEPENDECNY_ERROR, error);
        }
    }

    async fetchCmmsEnterprise() {

        let response: any;

        try {
            const assetNodeSearchURL = assetBaseUrl + assetNodesSearchURL();
            logger.debug("[ Asset Risk service # fetchAssetIdsForCache assetNodeSearchURL:" + assetNodeSearchURL + " ]");
            const body = await this.getNodeSearchOptions();
            response = await this.apiService.postReq(assetNodeSearchURL, body);
            logger.debug("[ Asset Risk service # fetchAssetIdsForCache response :" + response + " ]");
            return response?.data?.data?.[0];

        }
        catch (error: any) {
            logger.error("error in assetNodeSearch", error);
            throw new FacadeError("Error at assetNodesSearchURL 2 (v2/assets/nodes/search?limit=1000&offset=0)", ErrorCodes.DEPENDECNY_ERROR, error);
        }
    }

    sortandslice(array: any) {
        array = orderBy(array, ['ContributedValue'], ['desc']);
        array.length = array.length > 10 ? 10 : array.length;
        return array;
    }

    getDifferenceAB(array1: any, array2: any) {
        return array1.filter(
            (object1: any) => !array2.some(
                (object2: any) => object1.PhysicalAssetId === object2.nodeId
            ),
        );
    }
    getDifferenceBA(array1: any, array2: any) {
        return array1.filter(
            (object1: any) => !array2.some(
                (object2: any) => object1.nodeId === object2.PhysicalAssetId
            ),
        );
    }



    /**
     * 
     * @param assetId 
     * @param riskType  
     * @param groupByType 
     * @param contributorType 
     * @returns 
     */
    async getContributorList(contributorType: any, assetId: string, forceFetch: boolean, riskType: string, tenantid: string, groupType: string | null) {
        try {
            let topContributorData: any = [];
            logger.debug("asset risk service# getContributorList,riskType :" + riskType + " #assetId :" + assetId + "#contributorType :" + contributorType)

            //var mapKeyGetRiskValues = `riskService:{${tenantid}}:{${assetId}}:otherRisk` 
            var mapKeyGetRiskValues = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.OTHERRISK}`
            var getRiskValuesCacheddata = null;
            try {
                if (!forceFetch) {
                    getRiskValuesCacheddata = await this.cacheService.getCacheData(mapKeyGetRiskValues)
                }
            } catch (error: any) {
                logger.error('Error in AssetRiskService getRiskValuesCacheddata in getContributorList while creating the connection with CacheService Redis cache  instance: ', error);
                getRiskValuesCacheddata = null;
            }
            //----------------------------------
            var responseData: any;
            if (getRiskValuesCacheddata !== null) {
                responseData = JSON.parse(getRiskValuesCacheddata);
                logger.debug("[ getContributorList Response from Cache Cacheddata IN SERVICE onePM for cachedKey:" + mapKeyGetRiskValues + "]");
            }
            else {
                var res = await this.getRiskValues(assetId);
                if (res != null && res?.data != null && res?.data !== undefined) {
                    responseData = res.data;
                    this.cacheService.setCacheData(mapKeyGetRiskValues, CACHED_TIME_TO_LIVE, JSON.stringify(responseData));
                    logger.debug("[ getContributorList Stored CatchedData succss for cachedKey: " + mapKeyGetRiskValues + "  ]");
                } else {
                    responseData = null;
                }

            }
            let asset: any;

            // TO BE REMOVED ONCE LOGICAL PARENT IS SEPARATED
            if (groupType?.toLowerCase() === 'fleet') {
                asset = await this.fetchCmmsEnterprise();
            }

            if (responseData != null && responseData !== undefined) {
                for (const type of contributorType) {
                    if (contributorType !== undefined && type.includes("system")) {
                        topContributorData.SystemContributors = await this.getContributorData(responseData, assetId, riskType, 'SystemContributors', groupType || '', asset);
                    } else if (contributorType !== undefined && type.includes("failure")) {
                        topContributorData.FailureModeContributors = await this.getContributorData(responseData, assetId, riskType, 'FailureModeContributors', groupType || '', asset);
                    } else if (contributorType !== undefined && type.includes("investigation")) {
                        topContributorData.InvestigationContributors = await this.getContributorData(responseData, assetId, riskType, 'InvestigationContributors', groupType || '', asset);
                    } else if (contributorType !== undefined && type.includes("asset")) {
                        topContributorData.PhysicalAssetContributors = await this.getContributorData(responseData, assetId, riskType, 'PhysicalAssetContributors', groupType || '', asset);
                    } else if (contributorType !== undefined && type.includes("nextlevel")) {
                        topContributorData.Contributors = await this.getContributorData(responseData, assetId, riskType, 'Contributors', groupType || '', asset);
                    } else {
                        logger.debug("getContributorList: IN SERVICE  contributorType not match:" + contributorType);
                    }
                }
            }
            return topContributorData;

        } catch (error: any) {
            logger.error('An error encountered while getContributorList in asset risk service,  Please check the server log for further details', error);
            //throw new FacadeError("An error encountered while GetContributorList.", ErrorCodes.DEPENDECNY_ERROR, error);
            return { error: true, statusCode: HttpCodes.INTERNAL_SERVER_ERROR }
        }

    }

    /**
     * GET ContributorData
     * @param assetId 
     * @param groupByType 
     * @param riskType 
     * @returns 
     */

    async getContributorData(riskValues: any, assetId: string, riskType: string, key: string = '', groupType: string = '', asset: any) {
        try {
            logger.debug("[ Asset Risk service # getContributorData# riskType :" + riskType + " #assetId :" + assetId + "]");
            const Contributors: any = [];
            logger.debug("" + groupType + " #groupType :" + asset + "]");
            let obj: any = { ContributedValue: 0 };
            riskValues?.forEach((item: any) => {
                if (item?.[key] !== undefined && item?.RiskType !== undefined && (item?.RiskType?.toLowerCase()).includes(riskType?.toLowerCase())) {
                    item?.[key]?.forEach((val: any) => {


                        logger.debug("[ Asset Risk service # getContributorData# item RiskType :" + item.RiskType + "# topContributors request riskType :" + riskType + "]");


                        // TO BE REMOVED ONCE LOGICAL PARENT IS SEPARATED
                        if (groupType?.toLowerCase() !== 'fleet' || key !== 'Contributors') {
                            obj = { ContributedValue: 0 };
                            obj['PhysicalAssetName'] = val.PhysicalAssetName;
                            obj['PhysicalAssetId'] = val.PhysicalAssetId;
                            obj['RiskType'] = riskType;
                            obj['PhysicalAssetDescription'] = val.PhysicalAssetDescription;
                        }

                        if (riskType?.toLowerCase() === 'total') {
                            obj['ContributedValue'] += val.TotalRiskCost;
                            obj['data'] = obj['data'] ? obj['data'] : [];
                            val.Values.forEach((v: any) => {
                                if (v.RiskType.toLowerCase() !== 'total') {
                                    const dataObj = obj["data"].find((d: any) => d.RiskType === v.RiskType);
                                    if (dataObj) {
                                        dataObj.Cost += v.Cost;
                                        dataObj.Value += v.Value;
                                    } else {
                                        obj["data"].push(v);
                                    }
                                }
                            });
                        } else if (riskType?.toLowerCase() === 'strategy') {
                            obj['ContributedValue'] += val.StrategyRiskCost;
                        } else if (riskType?.toLowerCase() === 'compliance') {
                            obj['ContributedValue'] += val.ComplianceRiskCost;
                        } else if (riskType?.toLowerCase() === 'defect') {
                            obj['ContributedValue'] += val.DefectRiskCost;
                        } else {
                            obj['ContributedValue'] += val.TotalRiskCost;
                        }

                        if (groupType?.toLowerCase() !== 'fleet' || key !== 'Contributors') {
                            Contributors.push(obj);
                        }
                    });
                } else {
                    logger.debug("[ Asset Risk service # getContributorData# other item RiskType :" + item.RiskType + "# topContributors request riskType :" + riskType + "]");

                }
            });


            // TO BE REMOVED ONCE LOGICAL PARENT IS SEPARATED
            if (groupType?.toLowerCase() === 'fleet' && key === 'Contributors' && obj['ContributedValue']) {
                obj['PhysicalAssetName'] = asset.name;
                obj['PhysicalAssetId'] = asset.id;
                obj['RiskType'] = riskType;
                obj['PhysicalAssetDescription'] = asset?.properties?.Description_value?.value || '';
                Contributors.push(obj);
            }


            //contributorsResponseObj = contributorsObjList;
            //-----------KPI AHM ConditionRisk TOP COntributors-----------------------
            //var conditionalTopContributors = await this.getConditionalTopContributors(groupByType); //Requirement change as per Rohit ,9thjune2023 
            //contributorsResponseObj['ConditionalTopContributors'] = conditionalTopContributors;
            return Contributors;

        } catch (error: any) {
            logger.error('An error encountered while getContributorData in asset risk service,  Please check the server log for further details', error);
            throw new FacadeError("An error encountered while getContributorData.", ErrorCodes.DEPENDECNY_ERROR, error);
        }
    }

    /**
     * 
     * @param assetId 
     * @returns 
     */
    async getAssetsNodesHierarchyByParents(assetId: string) {
        try {
            var childIds: any = [];
            //kpiBaseUrl
            var conditionalHeairachyURL = assetBaseUrl + assetsNodesHierarchyURL();
            logger.debug("[ Asset Risk service # getAssetsNodesHierarchyByParents conditionalHeairachy # assetId:" + assetId + "# conditionalHeairachyURL:" + conditionalHeairachyURL + "]");
            //kpiUrl+kpiURIs()
            const body = await this.getKpiHierarchyOptionsByParent(assetId);
            const response = await this.apiService.postReq(conditionalHeairachyURL, body)
            response?.data?.data?.forEach((data: any) => {
                if (data["parent"] != null && assetId !== data["id"]) {
                    data['PhysicalAssetDescription'] = data?.properties?.Description_value?.value || '';
                    childIds.push(data);
                } else {
                    logger.debug("[ Asset Risk service # getAssetsNodesHierarchyByParents # Parent NULL for assetId: " + assetId + "]");
                }

            });
            return childIds;

        } catch (error: any) {
            logger.error('An error encountered while getAssetsNodesHierarchyByParents in asset risk service,  Please check the server log for further details', error);
            //throw new FacadeError("An error encountered while getAssetsNodesHierarchyByParents.", ErrorCodes.DEPENDECNY_ERROR, error);
            return { error: true };
        }
    }

    /**
     * GET AssetsNodesHierarchyByParents
     * @param assetIds 
     * @returns 
     */
    async getAssetNameByAssetId(assetIds: any) {
        try {
            let assetResponseArray: any = []
            if (assetIds?.length > 0 && assetIds !== null && assetIds !== undefined) {
                const body = await this.getAssetFetchKpiOptions(assetIds);
                const assetNameResponse = await this.apiService.postReq(assetBaseUrl + assetNodeFetchUrl(), body)

                if (assetNameResponse?.data !== undefined) {
                    assetNameResponse.data.data?.forEach((element: any) => {
                        let assetObj: any = {};
                        assetObj.PhysicalAssetId = element?.id;
                        assetObj.PhysicalAssetName = element?.name;
                        assetObj['PhysicalAssetDescription'] = element?.properties?.Description_value?.value || '';
                        assetResponseArray.push(assetObj);
                    });

                }
                return assetResponseArray;
            }

        } catch (error: any) {
            throw new FacadeError("An error encountered while getAssetNameByAssetId for v1/meta/nodes/fetch", ErrorCodes.DEPENDECNY_ERROR, error);
        }
    }
    /**
     * 
     * @param assetIds 
     * @returns 
     */
    async getAssetFetchKpiOptions(assetIds: any) {
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getAssetFetchKpiOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth
            },
            "body": {
                "nodeIds": assetIds,
                "returnEdges": false
            }
        }
    }

    /**
     * 
     * @param assetId 
     * @param riskType 
     * @param tenantid 
     * @returns 
     */
    async getConditionalTopContributors(assetId: string, forceFetch: boolean, riskType: string, tenantid: string) {
        try {
            var topContributorData: any = {};
            //var mapKeygetConditionalTopContributors = `riskService:{${tenantid}}:{${assetId}}:conditionRiskTopContributors` 
            var mapKeygetConditionalTopContributors = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.CONDITIONRISKTOPCONTRIBUTORS}`
            var conditionalTopContributorCacheddata = null;
            try {
                if (!forceFetch) {
                    conditionalTopContributorCacheddata = await this.cacheService.getCacheData(mapKeygetConditionalTopContributors)
                }
                logger.debug("[ getConditionalTopContributors Response from try Cache Cacheddata" + conditionalTopContributorCacheddata + " ]");

            } catch (error: any) {
                logger.error('Error in AssetRiskService in getConditionalTopContributors while creating the connection with CacheService Redis cache  instance: ', error);
                conditionalTopContributorCacheddata = null;
            }
            if (conditionalTopContributorCacheddata !== null) {
                logger.debug("[ IF CONDITION getConditionalTopContributors ]");
                topContributorData = JSON.parse(conditionalTopContributorCacheddata);
                logger.debug("[ getConditionalTopContributors Response from Cache Cacheddata IN SERVICE  for cachedKey:" + mapKeygetConditionalTopContributors + "]");
            }
            else {
                logger.debug("[ getConditionalTopContributors Request  from CatchedData not found for cachedKey: " + mapKeygetConditionalTopContributors + "  ]");
                var childIds: any = [];
                var childDetails: any = [];
                childDetails = await this.getAssetsNodesHierarchyByParents(assetId);
                if (childDetails?.error) {
                    return { error: true };
                }
                if (childDetails !== null && childDetails !== undefined && childDetails?.length > 0) {
                    childDetails?.forEach((child: any) => {
                        if (child?.id !== assetId) {
                            childIds.push(child.id);
                        }
                    })
                    if (childIds !== null && childIds !== undefined && childIds?.length > 0) {
                        logger.debug("[ getConditionalTopContributors childIds" + childIds.length + " assetid: ]" + assetId);

                        if (childIds?.length < 100) {
                            const body = await this.getBulkKpiOptions(childIds);
                            const response = await this.apiService.postReq(kpiUrl + kpiBulkURL(), body);
                            let topContributorResponse: any = [];
                            let result =
                                childDetails.map((itm: any) => ({
                                    ...response?.data?.values?.find((item: any) => (item.nodeId === itm.id) && item),
                                    ...itm
                                }));
                            result?.forEach((element: any) => {
                                if (element?.value !== null) {
                                    topContributorResponse.push(element);
                                }
                            });
                            // topContributorData = result;
                            logger.debug('topContributorResponse', topContributorResponse)
                            topContributorData = topContributorResponse;
                        } else {
                            topContributorData = { error: true, statusCode: 'D001' };
                            this.cacheService.setCacheData(mapKeygetConditionalTopContributors, CACHED_TIME_TO_LIVE, JSON.stringify(topContributorData));
                            logger.debug("[ getConditionalTopContributors Stored CatchedData succss for cacheKey for D001 " + mapKeygetConditionalTopContributors + "  ]");
                        }
                    }
                }
                if (topContributorData != null && topContributorData !== undefined) {
                    this.cacheService.setCacheData(mapKeygetConditionalTopContributors, CACHED_TIME_TO_LIVE, JSON.stringify(topContributorData));
                    logger.debug("[ getConditionalTopContributors Stored CatchedData succss for cacheKey " + mapKeygetConditionalTopContributors + "  ]");
                }

            }
            return topContributorData;


        }
        catch (error: any) {
            logger.error('An error encountered while getConditionalTopContributors in asset risk service,  Please check the server log for further details' + assetId, error);
            //throw new FacadeError("An error encountered while getConditionalTopContributors.", ErrorCodes.DEPENDECNY_ERROR, error);
            return { error: true };
        }
    }

    /**
     * 
     * @param assetId 
     * @returns 
     */
    async getRiskValues(assetId: string): Promise<any> {
        //let riskValueResponse: any;
        try {
            logger.debug(`getRiskValues: IN SERVICE onePm RiskValue API  assetId :${assetId} # RiskValue Url is :` + (onePmBaseUrl + riskValueURL(assetId)));
            const body = await this.getOptions();
            const response = await this.apiService.getReq(onePmBaseUrl + riskValueURL(assetId), body);
            return response;
        } catch (error: any) {
            logger.error('An error encountered while getAssetRiskValues in asset risk service,  Please check the server log for further details', error);
            throw new FacadeError("An error encountered while getAssetRiskValues.", ErrorCodes.DEPENDECNY_ERROR, error);
        }

    }

    /**
     * 
     * @param assetId 
     * @param agserviceResponse 
     * @param tenantid 
     * @returns 
     */
    async getTotalRiskValues(assetId: string, forceFetch: boolean, agserviceResponse: any, tenantid: string, groupType: string) {

        let assetRiskArray: any = [];
        let conditionRisk: any = {};
        const ahmAssetId = groupType?.toLowerCase() === 'fleet' ? 'fleet' : assetId;
        try {
            //Constant
            //var mapKeyGetConditionalTotalRisk = `riskService:{${tenantid}}:{${assetId}}:totalConditionRisk`
            var mapKeyGetConditionalTotalRisk = `${Constant.RISKSERVICE}:{${tenantid}}:{${ahmAssetId}}:${Constant.TOTALCONDITIONRISK}`

            if (TENANT_INFO.cordantApp === false) {
                var getConditionalTotalRiskCacheddata = null;
                try {
                    if (!forceFetch) {
                        getConditionalTotalRiskCacheddata = await this.cacheService.getCacheData(mapKeyGetConditionalTotalRisk)
                    }
                } catch (error: any) {
                    logger.error('Error in AssetRiskService in getTotalRiskValues getConditionalTotalRiskCacheddata while creating the connection with CacheService Redis cache  instance: ', error);
                    getConditionalTotalRiskCacheddata = null;
                }

                if (getConditionalTotalRiskCacheddata !== null) {
                    conditionRisk = JSON.parse(getConditionalTotalRiskCacheddata);
                    logger.debug("[ getRiskValues Response from Cache getConditionalTotalRiskCacheddata IN SERVICE onePM for cachedKey:" + mapKeyGetConditionalTotalRisk + "]");
                } else {
                    conditionRisk = await this.getConditionalTotalRisk(ahmAssetId);
                    if (conditionRisk?.error) {
                        agserviceResponse.TotalRisk = { "errorStatusCode": HttpCodes.FAILED_DEPENDENCY, "data": null }
                        return agserviceResponse;
                    }
                    if (conditionRisk !== null) {
                        this.cacheService.setCacheData(mapKeyGetConditionalTotalRisk, CACHED_TIME_TO_LIVE, JSON.stringify(conditionRisk));
                        logger.debug("[ Stored getConditionalTotalRisk Cached data succss for cachedKey: " + mapKeyGetConditionalTotalRisk + "  ]");
                    }
                }

            }

            var responseData: any;
            //var mapKeyGetRiskValues = `riskService:{${tenantid}}:{${assetId}}:otherRisk` 
            var mapKeyGetRiskValues = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.OTHERRISK}`
            var getRiskValuesCacheddata = null;
            try {
                if (!forceFetch) {
                    getRiskValuesCacheddata = await this.cacheService.getCacheData(mapKeyGetRiskValues)
                }
            } catch (error: any) {
                logger.error('Error in AssetRiskService in getTotalRiskValues getRiskValuesCacheddata while creating the connection with CacheService Redis cache  instance: ', error);
                getRiskValuesCacheddata = null;
            }

            if (getRiskValuesCacheddata !== null) {
                responseData = JSON.parse(getRiskValuesCacheddata);
                logger.debug("[ getRiskValues Response from Cache Cacheddata IN SERVICE onePM for cachedKey:" + mapKeyGetRiskValues + "]");
            }
            else {
                var res = await this.getRiskValues(assetId);
                if (res != null && res?.data != null && res?.data !== undefined) {
                    responseData = res?.data;
                    this.cacheService.setCacheData(mapKeyGetRiskValues, CACHED_TIME_TO_LIVE, JSON.stringify(responseData));
                    logger.debug("[ Stored CatchedData succss  for cachedKey: " + mapKeyGetRiskValues + "  ]");
                } else {
                    responseData = null;

                }
            }

            let index = 0;
            if (!TENANT_INFO.cordantApp) {
                assetRiskArray.push(conditionRisk);
                index++;
            }
            if (responseData != null && responseData !== undefined) {
                RiskOrders.forEach((riskType: string) => {
                    const findObj = responseData.find((risk: any) => risk.RiskType?.toLowerCase() === riskType?.toLowerCase() && risk?.RiskType?.toLowerCase() != 'baseline' && risk?.RiskType?.toLowerCase() !== 'total');
                    if (findObj) {
                        assetRiskArray[index] = {
                            'RiskType': findObj.RiskType,
                            'CurrentCost': findObj.CurrentCost,
                            'TrendCost': findObj.TrendCost || 0
                        };
                        index++;
                    }
                });
            }
            agserviceResponse.TotalRisk = { "errorStatusCode": "", "data": assetRiskArray }
            return agserviceResponse;
        } catch (error: any) {
            logger.error('An error encountered while getAssetRiskValues in asset risk service,  Please check the server log for further details', error);
            agserviceResponse.TotalRisk = { "errorStatusCode": HttpCodes.FAILED_DEPENDENCY, "data": null }
            return agserviceResponse;
            //throw new FacadeError("An error encountered while getAssetRiskValues.", ErrorCodes.DEPENDECNY_ERROR, error);
        }

    }

    /**
     * 
     * @param assetId 
     * @param agserviceResponse 
     * @param timeHistoryFilter 
     * @param tenantid 
     * @returns 
     */
    async getTotalRiskHistoryValues(assetId: string, forceFetch: boolean, agserviceResponse: any, timeHistoryFilter: any, tenantid: string, riskType: string, groupType: string) {
        logger.debug(`getTotalRiskHistoryValues AssetRiskService redisClient cacheService status : ${riskType}` + this.cacheService.getStatus());
        const ahmAssetId = groupType?.toLowerCase() === 'fleet' ? 'fleet' : assetId;

        let totalRiskAray: any = [];
        /** conditional Total risk History */
        let conditionRiskTrendValues: any = [];
                if (TENANT_INFO.cordantApp === false) {
            //************* [ STORING getTrendCount API IN  CACHE ]************************
            const startEndTime = this.queueService.getStartEndTime();

            if (startEndTime !== undefined) {
                //var startdate = new Date(startTime).getFullYear() + "-" + (new Date(startTime).getMonth() + 1) + "-" + new Date(startTime).getDate();
                //var enddate = new Date(endTime).getFullYear() + "-" + (new Date(endTime).getMonth() + 1) + "-" + new Date(endTime).getDate();
                //conditionRiskHistory:{<tenant-id>}:{<asset-id>}:{<start-date>}:{<end-date>}:”trendCount”
                var mapKeyGetTrendCount = `{${Constant.CONDITIONRISKHISTORY}}:{${tenantid}}:{${ahmAssetId}}:{${startEndTime.startDate}}:{${startEndTime.endDate}}:{${Constant.TRENDCOUNT}}`
                timeHistoryFilter.startTime = new Date(startEndTime.startDate).toISOString();
                timeHistoryFilter.endTime = new Date(startEndTime.endDate).toISOString();
                logger.debug("[ getTrendCountCacheddata cachedKey:" + mapKeyGetTrendCount + "]");
                var getTrendCountCacheddata = null;
                try {
                    if (!forceFetch) {
                        getTrendCountCacheddata = await this.cacheService.getCacheData(mapKeyGetTrendCount)
                    }
                } catch (error: any) {
                    logger.error('Error in AssetRiskService in getTotalRiskHistoryValues, getTrendCountCacheddata while creating the connection with CacheService Redis cache  instance: ', error);
                    getTrendCountCacheddata = null;
                }

                if (getTrendCountCacheddata !== null) {
                    conditionRiskTrendValues = JSON.parse(getTrendCountCacheddata);
                    logger.debug("[ getTotalRiskHistoryValues, Response from Cache getTrendCountCacheddata IN SERVICE TrendCount API  cachedKey:" + mapKeyGetTrendCount + "]");
                } else {
                    //  Actual API call for trendCount APIs

                    conditionRiskTrendValues = await this.getTrendCount(ahmAssetId, timeHistoryFilter);
                    if (conditionRiskTrendValues?.error) {
                        agserviceResponse.TotalRiskHistory = { "errorStatusCode": HttpCodes.FAILED_DEPENDENCY, "data": null }
                        return agserviceResponse;
                    }
                    if (conditionRiskTrendValues !== null) {
                        this.cacheService.setCacheData(mapKeyGetTrendCount, CACHED_TIME_TO_LIVE, JSON.stringify(conditionRiskTrendValues));
                        logger.debug("[ getTotalRiskHistoryValues, Stored getTrendCountCacheddata Cached data succss for TrendCount API cachedKey: " + mapKeyGetTrendCount + "  ]");
                    }
                }
            }

        }
        try {
            //----------Redis cache
            var responseData: any;
            //var mapKeyGetRiskValues = `riskService:{${tenantid}}:{${assetId}}:otherRisk` 
            var mapKeyGetRiskValues = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.OTHERRISK}`
            var getRiskValuesCacheddata = null;
            try {
                if (!forceFetch) {
                    getRiskValuesCacheddata = await this.cacheService.getCacheData(mapKeyGetRiskValues)
                }
            } catch (error: any) {
                logger.error('Error in AssetRiskService getRiskValuesCacheddata in getTotalRiskHistoryValues while creating the connection with CacheService Redis cache  instance: ', error);
                getRiskValuesCacheddata = null;
            }

            if (getRiskValuesCacheddata !== null) {
                responseData = JSON.parse(getRiskValuesCacheddata);
                logger.debug("[ getTotalRiskHistoryValues Response from Cache Cacheddata IN SERVICE onePM for cachedKey:" + mapKeyGetRiskValues + "]");
            }
            else {
                var res = await this.getRiskValues(assetId);
                if (res != null && res?.data != null && res?.data !== undefined) {
                    responseData = res.data;
                    this.cacheService.setCacheData(mapKeyGetRiskValues, CACHED_TIME_TO_LIVE, JSON.stringify(responseData));
                    logger.debug("[ Stored CatchedData succss for cachedKey: " + mapKeyGetRiskValues + "  ]");
                } else {
                    responseData = null;
                }

            }

            let conditionRiskTrendTemp: any = {};
            conditionRiskTrendTemp = await this.getTotalConditionalRiskHistory(conditionRiskTrendValues);

            if (responseData != null && responseData !== undefined) {
                responseData?.forEach((item: any) => {
                    if (item.RiskType?.toLowerCase() === 'total') {
                        item?.Values?.forEach((v: any) => {
                            const date = new Date(v.Date);
                            const monthName = Months[date.getMonth()];
                            let displayValue = monthName + " " + date.getFullYear().toString();
                            const cData: any = conditionRiskTrendTemp?.cumulative?.[0]?.values.find((c: any) => {
                                const cDate = new Date(c.Date);
                                const cMonthName = Months[cDate.getMonth()];
                                let cDisplayValue = cMonthName + " " + cDate.getFullYear().toString();
                                return displayValue === cDisplayValue;
                            })
                            if (cData) {
                                v.Cost += cData.Cost;
                                v.Value = v.Cost;
                            }
                        })
                    }
                    
                    if (RiskHistoryMappingIgnoreFields[riskType].indexOf(item.RiskType) === -1) {
                        let customRiskHistory: any = {
                            RiskType: "",
                            values: []
                        }
                        customRiskHistory.RiskType = item.RiskType;
                        customRiskHistory.values = item.Values;
                        totalRiskAray.push(customRiskHistory);
                    }
                });
            }

            if (TENANT_INFO.cordantApp === false && RiskHistoryMappingIgnoreFields[riskType].indexOf('Condition') === -1) {
                if (riskType?.toLowerCase() === 'condition') {
                    totalRiskAray.push(...conditionRiskTrendTemp.condition);
                    if (conditionRiskTrendTemp?.cumulative?.[0]?.RiskType) {
                        conditionRiskTrendTemp.cumulative[0].RiskType = 'Total';
                        totalRiskAray.push(...conditionRiskTrendTemp.cumulative);
                    }
                } else {
                    totalRiskAray.push(...conditionRiskTrendTemp.cumulative);
                }
            }
            let riskHistory: any = [];
            if (riskType?.toLowerCase() !== 'condition') {
                let index = 0;
                RiskOrders.forEach((riskTypes: string) => {
                    const findObj = totalRiskAray.find((risk: any) => risk.RiskType?.toLowerCase() === riskTypes?.toLowerCase());
                    if (findObj) {
                        riskHistory[index] = findObj;
                        index++;
                    }
                });
            } else {
                riskHistory = totalRiskAray;
                const findTotalIndex = totalRiskAray.findIndex((risk: any) => risk.RiskType?.toLowerCase() === 'total');
                if (findTotalIndex !== -1) {
                    const data = totalRiskAray[findTotalIndex];
                    totalRiskAray.splice(findTotalIndex, 1);
                    totalRiskAray.push(data);
                }
            }

            agserviceResponse.TotalRiskHistory = { "errorStatusCode": "", "data": riskHistory }//totalRiskAray;
            return agserviceResponse;
        } catch (error: any) {
            logger.error('An error encountered while getTotalRiskHistoryValues in asset risk service,  Please check the server log for further details', error);
            //throw new FacadeError("An error encountered while getTotalRiskHistoryValues.", ErrorCodes.DEPENDECNY_ERROR, error);
            agserviceResponse.TotalRiskHistory = { "errorStatusCode": HttpCodes.FAILED_DEPENDENCY, "data": null }
            return agserviceResponse;
        }

    }

    /**
     * 
     * @param assetId 
     * @returns 
     */
    async getConditionalContributors(assetId: string, tenantid: string) {
        var res: any = [], kpiTopContributorData: any = [];
        const body = await this.getContributorKpiOptions(assetId, "conditionrisk");
        let nodeIdArray: any = [];
        var response = null;
        var responseData = null;
        logger.debug("[ getTopContributorsForCondition ]");
        var mapKeygetTopContributorsForCondition = `${Constant.RISKSERVICE}:{${tenantid}}:{${assetId}}:${Constant.TOPCONTRIBUTORSFORCONDITION}`
        var topContributorsForConditionCacheddata = null;
        try {
            topContributorsForConditionCacheddata = await this.cacheService.getCacheData(mapKeygetTopContributorsForCondition)
        } catch (error: any) {
            logger.error('Error in AssetRiskService in getTopContributorsForCondition while creating the connection with CacheService Redis cache  instance: ', error);
            topContributorsForConditionCacheddata = null;
        }
        if (topContributorsForConditionCacheddata !== null) {
            logger.debug("[ IF CONDITION getTopContributorsForCondition ]");
            responseData = JSON.parse(topContributorsForConditionCacheddata);
            logger.debug("[ getTopContributorsForCondition Response from Cache Cacheddata IN SERVICE  for cachedKey:" + mapKeygetTopContributorsForCondition + "]");
        }
        else {
            logger.debug("[ getTopContributorsForCondition Request  from CatchedData not found for cachedKey: " + mapKeygetTopContributorsForCondition + "  ]");
            response = await this.apiService.postReq(kpiUrl + topContributorsURL(), body);
            if (response != null && response?.data != null && response?.data !== undefined) {
                responseData = response.data;
                this.cacheService.setCacheData(mapKeygetTopContributorsForCondition, CACHED_TIME_TO_LIVE, JSON.stringify(responseData));
                logger.debug("[ getTopContributorsForCondition Stored CatchedData succss for cachedKey: " + mapKeygetTopContributorsForCondition + "  ]");
            }
        }

        if (responseData != null && responseData !== undefined) {
            //----------------------
            if (responseData?.topContributors?.length > 0 && responseData?.topContributors != null && responseData?.topContributors != undefined) {
                responseData?.topContributors?.forEach(async (element: any) => {
                    nodeIdArray.push(element.nodeId);
                });
                res = await this.getAssetNameByAssetId(nodeIdArray);
            }
            kpiTopContributorData = responseData;

            var conditionalContributorsResponse: any = []


            if (res?.length > 0 && res != null && res !== undefined) {
                let result1 = res.map((itm: any) => ({
                    ...kpiTopContributorData.topContributors.find((item: any) => (item.nodeId === itm.PhysicalAssetId) && item),
                    ...itm
                }));
                // var conditionalContributorsResponse: any = []
                result1?.forEach((element: any) => {
                    if (element?.value !== null) {
                        let obj: any = {}
                        obj.PhysicalAssetId = element.PhysicalAssetId;
                        obj.PhysicalAssetName = element.PhysicalAssetName;
                        obj['PhysicalAssetDescription'] = element.PhysicalAssetDescription;
                        obj.ContributedValue = element.value !== null ? element.value : null;
                        obj.RiskType = "Condition";
                        conditionalContributorsResponse.push(obj);
                    }
                });
            }
            return conditionalContributorsResponse;
        }

    }

    /**
     * 
     * @param assetId 
     * @returns 
     */
    public async getConditionalTotalRisk(assetId: string) {
        let customConditionalRisk = {
            RiskType: "",
            CurrentCost: 0,
            TrendCost: 0,
            error: false
        };
        try {
            logger.debug("getConditionalTotalRisk: IN SERVICE assetId:" + assetId + "#kpiUrl is :" + (kpiUrl + kpiURIs()));
            const body = await this.getKpiOptions(assetId, "conditionrisk_status");
            const response = await this.apiService.postReq(kpiUrl + kpiURIs(), body);


            response?.data?.forEach((data: any) => {
                logger.debug("[ Asset Risk service # getConditionalTotalRisk# value:" + data.values + "]");
                var totalCost = 0;
                if (data?.values != undefined && data?.values?.length > 0) {
                    //sum of total cost
                    data?.values?.forEach((costVal: any) => {
                        var cost = costVal?.filter((elem: any) => {
                            return elem?.name === "value";
                        });
                        cost?.forEach((element: any) => {
                            if (element?.name == "value") {
                                if (element?.value !== null || element?.value !== undefined || element?.value !== "") {
                                    totalCost += element.value;
                                }
                                else {
                                    totalCost = null as any;
                                }
                            }
                        });
                    });
                }
                else {
                    totalCost = null as any;
                }
                logger.debug(`getConditionalTotalRisk: totalCost :` + totalCost);
                customConditionalRisk.CurrentCost = totalCost;
                customConditionalRisk.TrendCost = null as any;
            });
            customConditionalRisk.RiskType = 'Condition';
            logger.debug(`getConditionalTotalRisk: 1 customConditionalRisk.CurrentCost :` + customConditionalRisk.CurrentCost);
            return customConditionalRisk;

        } catch (error: any) {
            logger.error('An error encountered while getConditionalTotalRisk in asset risk service,  Please check the server log for further details', error);
            //throw new FacadeError("An error encountered while getConditionalTotalRisk.", ErrorCodes.DEPENDECNY_ERROR, error);
            customConditionalRisk.error = true;
            return customConditionalRisk;
        }
    }

    /**
     * 
     * @param conditionRiskTrendValues 
     * @returns 
     */
    public async getTotalConditionalRiskHistory(conditionRiskTrendValues: any) {
        logger.debug("[ getTotalConditionalRiskHistory: IN SERVICE ]");
        var conditionRiskValues: any = { 'cumulative': [], 'condition': [] };

        const obj: any = {};
        const riskHistoryCumulative: any = {};
        for (const data of conditionRiskTrendValues?.data || []) {
            var riskHistoryValues: any = {};
            riskHistoryValues["RiskType"] = data["name"];
            var valuesArray: any = [];
            for (const dt of data["values"]) {
                var conditionAPIValues: any = {};
                conditionAPIValues["Cost"] = dt["value"];
                conditionAPIValues["Value"] = dt["value"];
                conditionAPIValues["Date"] = dt["timeStamp"];
                valuesArray.push(conditionAPIValues);

                if (!obj[dt["timeStamp"]]) {
                    obj[dt["timeStamp"]] = { "Cost": 0, "Value": "0", "Date": dt["timeStamp"] };
                }
                obj[dt["timeStamp"]]["Cost"] += dt["value"];
                obj[dt["timeStamp"]]["Value"] = obj[dt["timeStamp"]]["Cost"];
            }
            riskHistoryValues["values"] = valuesArray;
            conditionRiskValues.condition.push(riskHistoryValues);
        }
        if (Object.keys(obj)?.length) {
            riskHistoryCumulative["RiskType"] = 'Condition';
            riskHistoryCumulative["values"] = [];
        }
        for (let key in obj) {
            riskHistoryCumulative["values"].push(obj[key]);
        }
        if (Object.keys(obj)?.length) {
            conditionRiskValues.cumulative.push(riskHistoryCumulative);
        }

        //logger.debug("[ getTotalConditionalRiskHistory: IN SERVICE ,conditionRiskValues:"+conditionRiskValues+"]");

        return conditionRiskValues;
    }

    /**
     * 
     * @param assetId 
     * @param timeHistoryFilter 
     * @returns 
     */
    async getTrendCount(assetId: string, timeHistoryFilter: any) {
        logger.debug(`getTrendCount: IN SERVICE trendCountURL is :` + (kpiUrl + trendCountURL()) + "# assetId:" + assetId);
        var tempTrend = null;
        try {
            var startTime = timeHistoryFilter.startTime;
            var endTime = timeHistoryFilter.endTime;
            var groupBy = timeHistoryFilter.groupBy;
            const body = await this.trendCountOptions(assetId, startTime, endTime, groupBy);
            //logger.debug('get trend count body', JSON.stringify(body));
            tempTrend = await this.apiService.postReq(kpiUrl + trendCountURL(), body);
            //logger.debug('get trend count res', JSON.stringify(tempTrend?.data));
            if (tempTrend != null) {
                return tempTrend?.data;
            } else {
                return null;
            }
            //return tempTrend.data;

        } catch (error: any) {
            logger.error('An error encountered while Get TrendCount in asset risk service,  Please check the server log for further details' + assetId, error);
            //throw new FacadeError("An error encountered while getTrendCount." + assetId, ErrorCodes.DEPENDECNY_ERROR, error);
            return { error: true };
        }
    }

    /**
     * 
     * @param assetId 
     * @param startTime 
     * @param endTime 
     * @param groupBy 
     * @returns 
     */
    async trendCountOptions(assetId: string, startTime: any, endTime: any, groupBy: any) {
        logger.debug("In Service trendCountOptions: assetId: " + assetId);
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }

        //logger.debug("In Service trendCountOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth
            },
            "body": {
                "nodeId": assetId,
                "kpi": "conditionrisk",
                "startTime": startTime,
                "endTime": endTime,
                "groupBy": groupBy
            }
        }

    }

    /**
     * 
     * @returns 
     */
    async getOptions() {
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            auth = JSON.parse(token);
        }
        catch (e) {
            auth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getOptions: token: " + auth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": auth,
            }

        }
    }

    /**
     * 
     * @param assetId 
     * @param kpis 
     * @returns 
     */
    async getKpiOptions(assetId: string, kpis: string) {
        logger.debug("In Service getKpiOptions: assetId: " + assetId);

        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            auth = JSON.parse(token);
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            auth = 'bearer ' + token;
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }

        //logger.debug("In Service getKpiOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth
            },
            "body": {
                "nodeId": assetId, //"fleet" assetId -> dynamic
                "kpis": [kpis]
            }
        }

    }
    /**
     * 
     * @param assetId 
     * @param kpis 
     * @returns 
     */
    async getContributorKpiOptions(assetId: string, kpis: string) {
        logger.debug("In Service getKpiOptions: assetId: " + assetId);
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getContributorKpiOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth
            },
            "body": {
                "nodeId": assetId,
                "kpis": [kpis],
                "groupByType": "Component",
                "filter": {
                    "conditions": [
                        {
                            "field": "status",
                            "value": "Acceptable",
                            "operator": "!=",
                            "kpi": "assetstatus"
                        }
                    ]
                },
                "paging": {
                    "pageSize": 10,
                    "pageNumber": 1
                }
            }
        }

    }

    /**
     * 
     * @param assetId 
     * @returns 
     */
    async getKpiHierarchyOptions(assetId: string, body?: any) {
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getKpiHierarchyOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth
            },
            "body": {
                "startNode": [
                    body?.assetId ? body.assetId : assetId
                ],
                "level": body?.hierarchyLevel ? body.hierarchyLevel : hierarchyLevel,
                "returnEdges": false
            }
        }

    }


    async getKpiHierarchyOptionsByParent(assetId: string) {
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getKpiHierarchyOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth
            },
            "body": {
                "startNode": [
                    assetId
                ],
                "level": 1,
                "returnEdges": false
            }
        }

    }
    /**
     * 
     * @returns 
     */
    async getNodeSearchOptions() {
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getNodeSearchOptions: token: " + kpiAuth);
        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth,
            },
            "body": {
                "typeIds": [
                    "CMMS_ENTERPRISE"
                ]
            }
        }

    }


    /**
     * 
     * @param childIds 
     * @returns 
     */
    async getBulkKpiOptions(childIds: any) {
        //if (process.env.TENANT_INFO != undefined) {
        const token = await this.tokenService.getToken();
        try {
            kpiAuth = JSON.parse(token);
        }
        catch (e) {
            kpiAuth = 'bearer ' + token;
        }
        // } else {
        // }
        //logger.debug("In Service getBulkKpiOptions: token: " + kpiAuth);

        return {
            "headers": {
                "content-type": "application/json",
                "Authorization": kpiAuth,
            },
            "body": {
                "nodeIds": childIds,
                "kpi": "conditionrisk"
            }
        }

    }

     /**
     * 
     * @param item
     * @returns list of RiskTypes for items
     */
    private getRiskData(item:any) {
        return [
            {
                "Cost": null,
                "RiskType": "Strategy",
                "Value": null
            },
            {
                "Cost": null,
                "RiskType": "Compliance",
                "Value": null
            },
            {
                "Cost": null,
                "RiskType": "Defect",
                "Value": null
            },
            {
                "Cost": item.value,
                "RiskType": "Condition",
                "Value": item.value
            }
        ]
    }

}
