// external
import { v4 as uuidv4 } from 'uuid';

// internal
import { EnergySystem, TCostCurveType } from './classes/EnergySystem';
import { IEnergySystemScenarioInfo, IBuildingMeasureScenarioInfo } from '../calculation-model/calculate';

// this module defines data containers


/* Dictionaries */
export interface IDictProject {
  [index: string]: IProject;
}

export interface IDictBool {
  [index: string]: boolean;
}

export interface IUserInfo {
  gdprAccept: boolean;
  patchNotification: string;
}

export interface IProject {
  appVersion: string | null;
  calculationActive: boolean;
  calculationOk: boolean;
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

    const firstInsulationMeasureId = uuidv4();
    const firstWindowsMeasureId = uuidv4();
    const firstHvacMeasureId = uuidv4();
    this.buildingMeasures = {
      insulation: {
        [firstInsulationMeasureId]: new EnvelopeMeasure("insulation", firstInsulationMeasureId),
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
  buildingMeasures: Record<TBuildingMeasureCategory,IDictBuildingMeasure>;
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
  altitude: number = 0;
}

export class Country {
  country: string = "";
}

export class Climate {
  zone: string = "";
  designOutdoorTemperature: number = 0;
  filename: string = "";
}

export class DistrictGeometry {
  pipingLength: number = 0;
  distanceToDistrictHeatingNetwork: number = 0;
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
  buildingThermalProperties = new BuildingThermalProperties();
  //buildingOccupancy = new BuildingOccupancy(); // modify in scenarios?
  //scenarioInfos: Record<string,ScenarioInfo> = {};
  deleted: boolean = false;
  [key: string]: BuildingType[keyof BuildingType];
}

export class BuildingInformation {
  constructionYear: number = 1970;
  energyPerformanceCertificate: string = "";
  ownership: string = "";
  [key: string]: BuildingInformation[keyof BuildingInformation];
}

export class BuildingGeometry {
  grossFloorArea: number = 0;
  heatedVolume: number = 0;
  perimeter: number = 0;
  facadeAreaN: number = 0;
  facadeAreaE: number = 0;
  facadeAreaS: number = 0;
  facadeAreaW: number = 0;
  windowAreaN: number = 0;
  windowAreaE: number = 0;
  windowAreaS: number = 0;
  windowAreaW: number = 0;
  roofArea: number = 0;
  basementFloorArea: number = 0;
  basementWallArea: number = 0;
  numberOfFloorsAbove: number = 0;
  numberOfFloorsBelow: number = 0;
  floorHeight: number = 0;
  [key: string]: BuildingGeometry[keyof BuildingGeometry];
}

export const getBuildingArea = (buildingGeometry: BuildingGeometry, category: TBuildingMeasureScenarioCategory) : number  => {
  switch (category) {
    case "facade": 
      const facadeArea = 
        Number(buildingGeometry.facadeAreaE)
        + Number(buildingGeometry.facadeAreaN)
        + Number(buildingGeometry.facadeAreaW)
        + Number(buildingGeometry.facadeAreaS)
        - getBuildingArea(buildingGeometry, "windows");
      return facadeArea;
    case "roof":
      return Number(buildingGeometry.roofArea);
    case "windows":
      const windowsArea = 
        Number(buildingGeometry.windowAreaE)
        + Number(buildingGeometry.windowAreaN)
        + Number(buildingGeometry.windowAreaW)
        + Number(buildingGeometry.windowAreaS);
      return windowsArea;
    default:
      throw new Error("Area is undefined for this building measure category");
  }
}

export const getBuildingFoundationArea = (buildingGeometry: BuildingGeometry) => {
  return {
    wall: buildingGeometry.basementWallArea,
    floor: buildingGeometry.basementFloorArea,
  }
}

export class BuildingThermalProperties {
  buildingClass: string = "";
  facadeUValue: number = 0;
  windowUValue: number = 0;
  roofUValue: number = 0;
  basementWallUValue: number = 0;
  foundationUValue: number = 0;
  designIndoorTemperature: number = 20;
  [key: string]: BuildingThermalProperties[keyof BuildingThermalProperties];
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
  primaryEnergyFactorTotal: number = 0;
  emissionFactor: number = 0;
  currentPrice: number = 0;
  projectedPrice: number = 0;
  deleted: boolean = false;
  [key: string]: EnergyCarrier[keyof EnergyCarrier];
}

export interface IDictBuildingMeasure {
  [index: string]: IBuildingMeasure;
}

export const buildingMeasureCategories = [ "insulation", "windows", "hvac" ] as const;
export const buildingMeasureScenarioCategories = [
  "facade", "roof", "foundation", "windows", "hvac",
] as const;
export type TBuildingMeasureCategory = typeof buildingMeasureCategories[number];
export type TBuildingMeasureScenarioCategory = typeof buildingMeasureScenarioCategories[number];

export const convertTypes = (t1: string, t2: string, val: any) => {
  if (t1 === "TBuildingMeasureScenarioCategory" && t2 === "TBuildingMeasureCategory") {
    const guard = (v: any): v is TBuildingMeasureScenarioCategory  => {
      return buildingMeasureScenarioCategories.includes(v);
    }
    if (guard(val)) {
      return buildingMeasureScenarioCatToBuildingMeasureCat(val);
    } else {
      throw new Error(`Attempted conversion from ${t1} to ${t2} failed`);
    }
  } else {
    throw new Error(`Attempted conversion from ${t1} to ${t2} failed`);
  }
}

const buildingMeasureScenarioCatToBuildingMeasureCat = (cat: TBuildingMeasureScenarioCategory) => {
  switch(cat) {
    case "facade": case "roof": case "foundation": {
      return "insulation";
    } case "windows": case "hvac": {
      return cat;
    }
  }
}

export type TBuildingMeasureScenarioData = "facadeInsulationThickness" | "facadeRetrofittedArea" | "roofInsulationThickness" | "roofRetrofittedArea" | "foundationWallInsulationThickness" | "foundationWallRetrofittedArea" | "foundationFloorInsulationThickness" | "foundationFloorRetrofittedArea" | "windowsRetrofittedArea";

export interface IBuildingMeasure {
  id: string;
  category: TBuildingMeasureCategory;
  measureName: string;
  renovationCost: number;
  lifeTime: number;
  embodiedEnergy: number;
  deleted?: boolean;
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
  renovationCost: number = 0;
  lifeTime: number = 0;
  embodiedEnergy: number = 0;
  deleted: boolean = false;
}

export const createBuildingMeasure = (category: TBuildingMeasureCategory, id: string = uuidv4()) => {
  switch (category) {
    case "insulation":
      return new EnvelopeMeasure(category, id);
    case "windows":
      return new WindowMeasure(category, id);
    case "hvac":
      return new HvacMeasure(category, id);
  }
} 

export class EnvelopeMeasure extends BaseBuildingMeasure { 
  lambdaValue: number = 0;
  
  [key: string]: EnvelopeMeasure[keyof EnvelopeMeasure];
}

export class WindowMeasure extends BaseBuildingMeasure {  
  uValue: number = 0;
  gValue: number = 0;

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
  scenarios: Record<string, Scenario> = {};
}

export interface IBuildingMeasureResult {
  renovationCost: number;
  embodiedEnergy: number;
}

export interface IResultSummary {
  specificEmbodiedEnergy: number; // [kWh/m2]
  annualizedSpecificCost: number; // [€/m2a]
  buildingArea: number; // [m2]
  heatingNeed: number; // [kWh]
  decentralizedSystemSize: number; // [kW]
  centralizedSystemSize: number; // [kW]
  energySystems: {
    investmentCost: Record<TCostCurveType, number>;
    maintenanceCost: Record<TCostCurveType, number>;
    embodiedEnergy: Record<TCostCurveType, number>;
  };
  buildingMeasures: Record<TBuildingMeasureScenarioCategory,IBuildingMeasureResult>;
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
  decentralizedSystemSize: number = 0;
  centralizedSystemSize: number = 0;
  specificPrimaryEnergyUse: number = 0;
  specificEmissions: number = 0;
  energySystems = {
    investmentCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
    maintenanceCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
    embodiedEnergy: { intake: 0, generation: 0, circulation: 0, substation: 0, },
  };
  buildingMeasures = {
    roof: { renovationCost: 0, embodiedEnergy: 0, },
    facade: { renovationCost: 0, embodiedEnergy: 0, },
    foundation: { renovationCost: 0, embodiedEnergy: 0, },
    windows: { renovationCost: 0, embodiedEnergy: 0, },
    hvac: { renovationCost: 0, embodiedEnergy: 0, },
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
  energySystems: Record<string,IEnergySystemScenarioInfo> = { };
  buildingMeasures: Record<TBuildingMeasureScenarioCategory, Record<string, IBuildingMeasureScenarioInfo>> = {
    facade: { placeholder: { renovationCost: 0, embodiedEnergy: 0, }},
    roof: { placeholder: { renovationCost: 0, embodiedEnergy: 0, }},
    foundation: { placeholder: { renovationCost: 0, embodiedEnergy: 0, }},
    hvac: { placeholder: { renovationCost: 0, embodiedEnergy: 0, }},
    windows: { placeholder: { renovationCost: 0, embodiedEnergy: 0, }},
  };
  buildingTypes: Record<string, ScenarioInfo> = {}; 
  total: ResultSummary = new ResultSummary();
  deleted: boolean = false;
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

  buildingMeasures: Record<TBuildingMeasureScenarioCategory, TScenarioBuildingMeasureData> = {
    roof: {
      id: "",
      thickness: 0,
    },
    facade: {
      id: "",
      thickness: 0,
    },
    foundation: {
      id: "",
      wallThickness: 0,
      floorThickness: 0,
    },
    windows: {
      id: "",
    },
    hvac: {
      id: "",
    }
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

export type TScenarioBuildingMeasureData = IScenarioBuildingMeasureData | IScenarioEnvelopeMeasureData | IScenarioFoundationMeasureData;

export interface IScenarioBuildingMeasureData {
  id: string;
}

export interface IScenarioEnvelopeMeasureData extends IScenarioBuildingMeasureData {
  thickness: number;
}

export interface IScenarioFoundationMeasureData extends IScenarioBuildingMeasureData {
  wallThickness: number;
  floorThickness: number;
}

export interface IValidatorResult {
  valid: boolean;
  invalidMsg: string;
}

export enum Units {
  none = "",
  wattPerMeterKelvin = "W/mK",
  wattPerMeterSqKelvin = "W/m²K",
  years = "a",
  nonDimensional = "-",
  euro = "€",
  euroPerKiloWattHour = "€/kWh",
  euroPerYear = "€/a",
  euroPerMeterSq = "€/m²",
  euroPerCentimeterMeterSq = "€/(cm, m²)",
  percent = "%",
  airChangesHourly = "ACH",
  degC = "°C",
  kiloWatt = "kW",
  kiloWattHour = "kWh",
  kiloWattHourPerKiloWattHour = "kWh/kWh",
  kiloWattHourPerYear = "kWh/a",
  kiloWattHourPerMeterSq = "kWh/m²",
  kiloWattHourPerMeterSqYear = "kWh/m²a",
  kiloWattHourPerCentimeterMeterSq = "kWh/(cm, m²)",
  meter = "m",
  centimeter = "cm",
  meterSq = "m²",
  meterCubed = "m³",
  personsPerMeterSq = "persons/m²",
  kiloGramCO2EqPerKiloWattHour = "kg CO₂eq/kWh",
  kiloGramCO2EqPerYear = "kg CO₂eq/a",
}
  
