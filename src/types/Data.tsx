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
  }

  district: District = new District();
  buildings: IDictBuilding;
  energySystems: IDictEnergySystem;
  buildingMeasures: string = "Placeholder for building measure data";
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

export class EnergySystem {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  systemType: string = "";
  systemCategory: string = "";
  [key: string]: EnergySystem[keyof EnergySystem];
}

export class EnergySystemType {
  name: string = "";
}

