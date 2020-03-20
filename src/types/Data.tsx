//import { ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

// this module defines data containers

/* Dictionaries */
export interface IDictProject {
  [index: string]: IProject;
}

export interface IDictBool {
  [index: string]: boolean;
}

// todo: a bit ugly that we are not type checking here. but it was the only way I managed to allow both events and string as arguments
export interface IDictEventHandler {
  [index: string]: (e: any) => void;
}

export interface IProject {
  appVersion: string | undefined;
  id: string;
  name: string;
  owner: string;
  overviewData: OverviewData;
  calcData: CalcData;
  scenarioData: ScenarioData;
  deleted: boolean;
  test?: string;
}

export class OverviewData {
  // assessment information
  contactInfo: ContactInfo = new ContactInfo();
  toolsInfo: string = "";

  // results overview
  resultOverview: ResultOverview = new ResultOverview();

  // about
  aboutText: string = "";
}

export class ContactInfo {
  email: string = "";
  phone: string = "";
  name: string = "";
  affiliation: string = "";
}

export class ResultOverview {

}

// import CalcData from '@annex-75/calculation-model'
// todo: defined here now, should be moved to @annex-75/calculation-model npm package
export class CalcData {

  constructor() {
    const firstBuildingId = uuidv4();
    this.buildings = {
      [firstBuildingId]: new Building(firstBuildingId)
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
  buildings: IDictBuilding;
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

export interface IDictBuilding {
  [index: string]: Building;
}

// really is a building type/building typology
export class Building {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  buildingInformation = new BuildingInformation();
  buildingGeometry = new BuildingGeometry();
  //buildingOccupancy = new BuildingOccupancy(); // modify in scenarios?
  scenarioInfos: Record<string,ScenarioInfo> = {};
  [key: string]: Building[keyof Building];
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

const defSystemSizes = [ 50, 100, 150, 200, 250 ];
const defCostCurve = [ 0, 0, 0, 0, 0];

export class EnergySystem {
  constructor(id: string = uuidv4()) {
    this.id = id;
    this.costCurves = {};
    this.costCurves.investment = new CostCurveDict("euro");
    this.costCurves.maintenance = new CostCurveDict("euro/a");
    this.costCurves.embodiedEnergy = new CostCurveDict("co2eq/a");
  }
  id: string;
  name: string = "";
  systemType: string = "";
  systemCategory: string = "District";
  lifeTime: number = 0;
  energyCarrier: string = "";
  costCurves: Record<string,CostCurveDict>;
  [key: string]: EnergySystem[keyof EnergySystem];
}

export class CostCurveDict {
  constructor(unit: string) {
    this.intake.unit = unit;
    this.generation.unit = unit;
    this.circulation.unit = unit;
    this.substation.unit = unit;
  }
  systemSize: ICostCurve = {
    label: "System size [kW]",
    value: defSystemSizes,
    index: 0,
    unit: "kW",
  };
  intake: ICostCurve = {
    label: "Intake",
    value: defCostCurve,
    index: 1,
    unit: "",
  };
  generation: ICostCurve = {
    label: "Generation",
    value: defCostCurve,
    index: 2,
    unit: "",
  };
  circulation: ICostCurve = {
    label: "Circulation",
    value: defCostCurve,
    index: 3,
    unit: "",
  };
  substation: ICostCurve = {
    label: "Substation",
    value: defCostCurve,
    index: 4,
    unit: "",
  };
  [key: string]: CostCurveDict[keyof CostCurveDict]
}

export interface ICostCurve {
  label: string;
  unit: string;
  value: number[];
  index: number;
}

export class EnergySystemType {
  name: string = "";
}

export interface ICostCurveType {
  name: string;
  label: string;
  unit: string;
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
}

export interface IDictBuildingMeasure {
  [index: string]: IBuildingMeasure;
}

export type TBuildingMeasureCategory = "roof" | "facade" | "foundation" | "windows" | "hvac";

export interface IBuildingMeasure {
  id: string;
  category: TBuildingMeasureCategory;
  measureName: string;
  refurbishmentCost: number;
  lifeTime: number;

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

export class Scenario {
  constructor(scenarioId: string = uuidv4()) {
    this.id = scenarioId;
  }
  id: string;
  name: string = "";
}

export class ScenarioInfo {
  building: IScenarioBuildingData = {
    numberOfBuildings: 0,
    occupancy: "",
    occupants: 0,
    setPointTemp: 0,
    appliancesElectricityUsage: 0,
    domesticHotWaterUsage: 0,
  };
  economy: IScenarioEconomyData = {
    interestRate: 0,
    energyPriceIncrease: 0,
    calculationPeriod: 0,
  }
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
  
