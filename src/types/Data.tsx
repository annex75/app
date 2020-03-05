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

    const firstRoofMeasureId = uuidv4();
    const firstFacadeMeasureId = uuidv4();
    const firstFoundationMeasureId = uuidv4();
    const firstWindowsMeasureId = uuidv4();
    const firstHvacMeasureId = uuidv4();
    this.buildingMeasures = {
      roof: {
        [firstRoofMeasureId]: new BuildingMeasure("roof", firstRoofMeasureId),
      },
      facade: {
        [firstFacadeMeasureId]: new BuildingMeasure("facade", firstFacadeMeasureId),
      },
      foundation: {
        [firstFoundationMeasureId]: new BuildingMeasure("foundation", firstFoundationMeasureId),
      },
      windows: {
        [firstWindowsMeasureId]: new BuildingMeasure("windows", firstWindowsMeasureId),
      },
      hvac: {
        [firstHvacMeasureId]: new BuildingMeasure("hvac", firstHvacMeasureId),
      },
    }
  }

  district: District = new District();
  buildings: IDictBuilding;
  energySystems: IDictEnergySystem;
  buildingMeasures: Record<string,IDictBuildingMeasure>;
}

export class District {
  // location information
  location: Location = new Location();
  climate: Climate = new Climate();
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

export interface IDictBuilding {
  [index: string]: Building;
}

export class Building {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  buildingInformation = new BuildingInformation();
  buildingGeometry = new BuildingGeometry();
  buildingOccupancy = new BuildingOccupancy();
  scenarioInfos: Record<string,ScenarioInfo> = {};
  [key: string]: Building[keyof Building];
}

export class BuildingInformation {
  constructionYear: number = 1970;
  energyPerformanceCertificate: string = "";
  [key: string]: BuildingInformation[keyof BuildingInformation];
}

export class BuildingGeometry {
  grossFloorArea: number = 0;
  [key: string]: BuildingGeometry[keyof BuildingGeometry];
}

export class BuildingOccupancy {
  occupants: number = 0;
  [key: string]: BuildingOccupancy[keyof BuildingOccupancy];
}

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

export interface IDictBuildingMeasure {
  [index: string]: BuildingMeasure;
}

export type TBuildingMeasureCategory = "roof" | "facade" | "foundation" | "windows" | "hvac";

export class BuildingMeasure {
  constructor(category: TBuildingMeasureCategory, id: string = uuidv4()) {
    this.id = id;
    this.category = category;
    switch(category) {
      case "roof":
      case "facade":
      case "foundation":
      case "windows":
        this.uValue = 0;
        break;
      case "hvac":
        this.efficiency = 1;
        break;
      default:
        throw new Error(`Building measure category ${category} has not been defined.`);
    }
  }
  id: string;
  category: TBuildingMeasureCategory;
  measureName: string = "";
  refurbishmentCost: number = 0;
  
  uValue?: number | null = null;
  efficiency?: number | null = null;

  [key: string]: BuildingMeasure[keyof BuildingMeasure];
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
}
  
