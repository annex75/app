import { ComponentType, ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

// this module defines data containers

/* Dictionaries */
export interface IDictProject {
    [index: string]: IProject;
}

export interface IDictBool {
    [index: string]: boolean;
}

export interface IDictComponentType {
    [index: string]: ComponentType<any>;
}

export interface IDictEventHandler {
    [index: string]: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface IDictDictEventHandler {
    [index: string]: IDictEventHandler;
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
    district: District = new District();
    buildings: IDictBuilding = { PLACEHOLDER: new Building() };
    energySystems: string = "Placeholder for energy system data";
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
    id: string = uuidv4();
    name: string = "";
}
