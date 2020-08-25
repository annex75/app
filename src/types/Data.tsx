// external
import { v4 as uuidv4 } from 'uuid';

// internal
import { EnergySystem, TCostCurveType } from './classes/EnergySystem';
import { IEnergySystemScenarioInfo, IBuildingMeasureScenarioInfo } from '../calculation-model/calculate';
export * from './classes/Project';
export * from './classes/EnergySystem';

// this module defines data containers

/* Dictionaries */
export interface IDictProject {
  [index: string]: IProject;
}

export interface IDictBool {
  [index: string]: boolean;
}

export interface IProject {
  appVersion: string | null;
  calculationActive: boolean;
  id: string;
  name: string;
  owner: string;
  overviewData: OverviewData;
  calcData: CalcData;
  scenarioData: ScenarioData;
  deleted: boolean;
  test?: string;
  timeStamp: number;
}

interface IXlsxData {
  key: string;
  value: any;
}

export class OverviewData {
  // assessment information
  contactInfo: ContactInfo = new ContactInfo();
  toolsInfo: string = "";

  // results overview
  resultOverview: ResultOverview = new ResultOverview();

  // about
  aboutText: string = "";

  [key: string]: any;
}

export type TXlsxable = OverviewData | BuildingType;

// objKeys: data stored in nested objects
// valKeys: data stored directly in this object
// returns an array of { key: key, value: value } objects
export const toXlsx = (source: TXlsxable, objKeys: string[], valKeys: string[]) => {
  let out: IXlsxData[] = [];
  objKeys.forEach(objKey => out.push(...(Object.keys(source[objKey] || {}).map(key => {
    return {
      key: key, 
      value: source[objKey][key],
    }
  }))));
  valKeys.map(valKey => out.push({
    key: valKey,
    value: source[valKey],
  }))
  return out;
}

export class ContactInfo {
  email: string = "";
  phone: string = "";
  name: string = "";
  affiliation: string = "";
  [key: string]: string;
}

export class ResultOverview {
  [key: string]: any;
}

// import CalcData from '@annex-75/calculation-model'
// todo: defined here now, should be moved to @annex-75/calculation-model npm package
export class CalcData {

  constructor() {
    const firstBuildingTypeId = uuidv4();
    this.buildingTypes = {
      [firstBuildingTypeId]: new BuildingType(firstBuildingTypeId)
    };

    const firstEnergySystemId = uuidv4();
    this.energySystems = {
      [firstEnergySystemId]: new EnergySystem(firstEnergySystemId)
    };

    const firstEnergyCarrierId = uuidv4();
    this.energyCarriers = {
      [firstEnergyCarrierId]: new EnergyCarrier(firstEnergyCarrierId)
    };

    const firstRoofMeasureId = uuidv4();
    const firstFacadeMeasureId = uuidv4();
    const firstFoundationMeasureId = uuidv4();
    const firstWindowsMeasureId = uuidv4();
    const firstHvacMeasureId = uuidv4();
    this.buildingMeasures = {
      roof: {
        [firstRoofMeasureId]: new EnvelopeMeasure("roof", firstRoofMeasureId),
      },
      facade: {
        [firstFacadeMeasureId]: new EnvelopeMeasure("facade", firstFacadeMeasureId),
      },
      foundation: {
        [firstFoundationMeasureId]: new BasementMeasure("foundation", firstFoundationMeasureId),
      },
      windows: {
        [firstWindowsMeasureId]: new WindowMeasure("windows", firstWindowsMeasureId),
      },
      hvac: {
        [firstHvacMeasureId]: new HvacMeasure("hvac", firstHvacMeasureId),
      },
    }
  }

  district: District = new District();
  buildingTypes: IDictBuildingType;
  energySystems: IDictEnergySystem;
  energyCarriers: IDictEnergyCarrier;
  buildingMeasures: Record<string,IDictBuildingMeasure>;
}

export class District {
  // location information
  location: Location = new Location();
  climate = new Climate();
  geometry: DistrictGeometry = new DistrictGeometry();
  energy: DistrictEnergy = new DistrictEnergy();
  //economy: DistrictEconomy = new DistrictEconomy(); // should this possibly be in Country?
}

export class Location {
  country: Country = new Country();
  place: string = "";
  lat: number = 0;
  lon: number = 0;
}

export class Country {
  country: string = "";
}

export class Climate {
  zone: string = "";
  filename: string = "";
}

export class DistrictGeometry {
  pipingLength: number = 0;
  districtToDistrictHeatingNetwork: number = 0;
  solarPanelArea: number = 0;
}

export class DistrictEnergy {
  heatSources: string = ""; // what should this be?
  gshpArea: number = 0; // is this a useful way of quantifying this?
}

/*
export class DistrictEconomy {
  interestRate: number = 0;
  energyPriceIncrease: number = 0;
}
*/

export interface IDictBuildingType {
  [index: string]: BuildingType;
}

export class BuildingType {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  buildingInformation = new BuildingInformation();
  buildingGeometry = new BuildingGeometry();
  //buildingOccupancy = new BuildingOccupancy(); // modify in scenarios?
  scenarioInfos: Record<string,ScenarioInfo> = {};
  deleted: boolean = false;
  [key: string]: BuildingType[keyof BuildingType];
}

export class BuildingInformation {
  constructionYear: number = 1970;
  buildingClass: string = "";
  energyPerformanceCertificate: string = "";
  ownership: string = "";
  [key: string]: BuildingInformation[keyof BuildingInformation];
}

export class BuildingGeometry {
  grossFloorArea: number = 0;
  heatedVolume: number = 0;
  facadeAreaN: number = 0;
  facadeAreaE: number = 0;
  facadeAreaS: number = 0;
  facadeAreaW: number = 0;
  windowAreaN: number = 0;
  windowAreaE: number = 0;
  windowAreaS: number = 0;
  windowAreaW: number = 0;
  roofArea: number = 0;
  foundationArea: number = 0;
  numberOfFloorsAbove: number = 0;
  numberOfFloorsBelow: number = 0;
  floorHeight: number = 0;
  [key: string]: BuildingGeometry[keyof BuildingGeometry];
}

/* modify in scenarios?
export class BuildingOccupancy {
  occupancy: string = "";
  occupants: number = 0;
  [key: string]: BuildingOccupancy[keyof BuildingOccupancy];
}
*/

export interface IDictEnergySystem {
  [index: string]: EnergySystem;
}

export interface IDictEnergyCarrier {
  [index: string]: EnergyCarrier;
}

export class EnergyCarrier {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  primaryEnergyFactorRe: number = 0;
  primaryEnergyFactorNonRe: number = 0;
  emissionFactor: number = 0;
  currentPrice: number = 0;
  deleted: boolean = false;
  [key: string]: EnergyCarrier[keyof EnergyCarrier];
}

export interface IDictBuildingMeasure {
  [index: string]: IBuildingMeasure;
}

export type TBuildingMeasureCategory = "roof" | "facade" | "foundation" | "windows" | "hvac";
export const buildingMeasureCategories: TBuildingMeasureCategory[] = [
  "roof", "facade", "foundation", "windows", "hvac",
];

export interface IBuildingMeasure {
  id: string;
  category: TBuildingMeasureCategory;
  measureName: string;
  refurbishmentCost: number;
  lifeTime: number;
  embodiedEnergy: number;

  [key: string]: IBuildingMeasure[keyof IBuildingMeasure];
}

abstract class BaseBuildingMeasure {
  constructor(category: TBuildingMeasureCategory, id: string = uuidv4()) {
    this.id = id;
    this.category = category;
  }
  id: string = uuidv4();
  category: TBuildingMeasureCategory;
  measureName: string = "";
  refurbishmentCost: number = 0;
  lifeTime: number = 0;
  embodiedEnergy: number = 0;
}

export const createBuildingMeasure = (category: TBuildingMeasureCategory, id: string = uuidv4()) => {
  switch (category) {
    case "roof":
    case "facade":
      return new EnvelopeMeasure(category, id);
    case "windows":
      return new WindowMeasure(category, id);
    case "foundation":
      return new BasementMeasure(category, id); 
    case "hvac":
      return new HvacMeasure(category, id);
  }
} 

export class EnvelopeMeasure extends BaseBuildingMeasure { 
  uValue: number = 0;
  
  [key: string]: EnvelopeMeasure[keyof EnvelopeMeasure];
}

export class WindowMeasure extends BaseBuildingMeasure {  
  uValue: number = 0;
  gValue: number = 0;

  [key: string]: WindowMeasure[keyof WindowMeasure];
}

export class BasementMeasure extends BaseBuildingMeasure {
  foundationUValue: number = 0;
  basementWallUValue: number = 0;

  [key: string]: WindowMeasure[keyof WindowMeasure];
}

export class HvacMeasure extends BaseBuildingMeasure {  
  ventilationType: string = "";
  coolingType: string = "None";
  heatingType: string = "None";
  energyCarrier: string = "";
  efficiency: number = 0;
  recoveryEfficiency: number = 0;
  coldWaterTemp: number = 15;
  hotWaterTemp: number = 80;
  ventilationRate: number = 0.5;

  [key: string]: EnvelopeMeasure[keyof EnvelopeMeasure];
}

export class ScenarioData {
  scenarios: Record<string,Scenario> = {};
}

export interface IBuildingMeasureResult {
  refurbishmentCost: number;
  embodiedEnergy: number;
}

export interface IResultSummary {
  specificEmbodiedEnergy: number; // [kWh/m2]
  annualizedSpecificCost: number; // [€/m2a]
  buildingArea: number; // [m2]
  heatingNeed: number; // [kWh]
  energySystems: {
    investmentCost: Record<TCostCurveType, number>;
    maintenanceCost: Record<TCostCurveType, number>;
    embodiedEnergy: Record<TCostCurveType, number>;
  };
  buildingMeasures: Record<TBuildingMeasureCategory,IBuildingMeasureResult>;
  // specificGHGEmissions: number; // todo: implement
  // annualizedSpecificInvestmentCost: number;
  // specificMaintenanceCost: number;
  [key: string]: IResultSummary[keyof IResultSummary];
}

export class ResultSummary implements IResultSummary {
  specificEmbodiedEnergy: number = 0;
  annualizedSpecificCost: number = 0;
  buildingArea: number = 0;
  heatingNeed: number = 0;
  specificPrimaryEnergyUse: number = 0;
  specificEmissions: number = 0;
  energySystems = {
    investmentCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
    maintenanceCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
    embodiedEnergy: { intake: 0, generation: 0, circulation: 0, substation: 0, },
  };
  buildingMeasures = {
    roof: { refurbishmentCost: 0, embodiedEnergy: 0, },
    facade: { refurbishmentCost: 0, embodiedEnergy: 0, },
    foundation: { refurbishmentCost: 0, embodiedEnergy: 0, },
    windows: { refurbishmentCost: 0, embodiedEnergy: 0, },
    hvac: { refurbishmentCost: 0, embodiedEnergy: 0, },
  };
  [key: string]: ResultSummary[keyof ResultSummary];
}

export class Scenario {
  constructor(scenarioId: string = uuidv4()) {
    this.id = scenarioId;
  }
  id: string;
  name: string = "";
  economy: IScenarioEconomyData = {
    interestRate: 0,
    energyPriceIncrease: 0,
    calculationPeriod: 0,
  }
  energySystems: Record<string,IEnergySystemScenarioInfo> = {};
  buildingMeasures: Record<TBuildingMeasureCategory, Record<string, IBuildingMeasureScenarioInfo>> = {
    roof: {},
    facade: {},
    foundation: {},
    hvac: {},
    windows: {},
  };
  total: ResultSummary = new ResultSummary();
}

export class ScenarioInfo {
  buildingType: IScenarioBuildingData = {
    numberOfBuildings: 0,
    heatingNeed: 0, // [kWh]
    occupancy: "",
    occupants: 0,
    setPointTemp: 0, // [degC]
    appliancesElectricityUsage: 0, // [?]
    domesticHotWaterUsage: 0, // [?]
  };

  energySystem: Record<string,string> = {
    energySystem: "",
  };

  buildingMeasures: Record<TBuildingMeasureCategory,string> = {
    roof: "",
    facade: "",
    foundation: "",
    windows: "",
    hvac: "",
  };
  [index: string]: ScenarioInfo[keyof ScenarioInfo];
}

export interface IScenarioBuildingData {
  numberOfBuildings: number;
  heatingNeed: number;
  occupancy: string;
  occupants: number;
  setPointTemp: number;
  appliancesElectricityUsage: number;
  domesticHotWaterUsage: number;
}

export interface IScenarioEconomyData {
  interestRate: number;
  energyPriceIncrease: number;
  calculationPeriod: number;
}

export interface IValidatorResult {
  valid: boolean;
  invalidMsg: string;
}
  
