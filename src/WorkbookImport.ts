// external
import { WorkBook } from 'xlsx';
import _ from 'lodash';//{ set as _fpSet } from 'lodash/fp';

// internal
import { Project, BuildingType, createBuildingMeasure, TBuildingMeasureCategory, EnergyCarrier } from "./types";
import * as config from './config.json';

interface IWorkbookEntry {
  sheet: string;
  keyCell?: string;
  valueCell: string;
  key?: string;
  path?: string;
}

interface IBuildingTypeWorkbookEntry {
  row: number;
  key: string;
  localPath: string;
}

interface IRenovationMeasureWorkbookEntry {
  row: number;
  key: string;
  category: string;
  localPath: string;
}

const charToInt = (c: string) => {
  return c.toLowerCase().charCodeAt(0) - 96;
}

const intToChar = (i: number) => {
  return String.fromCharCode(i+96).toUpperCase();
}

const deprecatedAppVersions = [ "0.2.6-0", ];

const buildingTypeSheet = "04_building_typology";
const buildingTypeKeyCol = "A";
const buildingTypeFirstValueCol = "E";
const firstValueColIndex = charToInt(buildingTypeFirstValueCol);
const buildingTypeMandatoryRow = 6;

const refCaseSheet = "05_reference_case_typology";
const refCaseKeyCol = "A";
const refCaseFirstValueCol = "C";
const refCaseFirstValueColIndex = charToInt(refCaseFirstValueCol);

const energyCarrierSheet = "08_energy_carriers";
const energyCarrierKeyRow = 3;
const energyCarrierFirstValueRow = 5;
const energyCarrierNameCol = "A";
const energyCarrierKeyAfterLastKey = "Other (specify)";

export const updateFromWorkbook = (project: Project, workbook: WorkBook) => {
  if (!validateWorkbook(workbook)) {
    throw new Error( "Project could not be added from workbook: workbook is invalid");
  }

  if (deprecatedAppVersions.includes(project.appVersion)) {
    throw new Error( "Project could not be added from workbook: app version is not supported");
  }

  // add simple parameters
  dictionary.forEach(entry => {
    const sheet = workbook.Sheets[entry.sheet]
    if (sheet[entry.keyCell!].v === entry.key && sheet[entry.valueCell]) {
      _.set(project, entry.path!, String(sheet[entry.valueCell].v));
    }
  });

  // add buildingTypes
  // remove placeholder building types
  for (const key in project.calcData.buildingTypes) {
    delete project.calcData.buildingTypes[key];
  }

  const numBuildingTypes = getNumBuildingTypes(workbook, buildingTypeSheet, buildingTypeFirstValueCol, buildingTypeMandatoryRow);
  let bIds: string[] = [];
  let bNames: string[] = [];
  for (let i = 0; i < numBuildingTypes; i++) {
    const sheet = workbook.Sheets[buildingTypeSheet];
    const valCell = `${intToChar(firstValueColIndex+i)}${buildingTypeNameCell.row}`;
    const b = new BuildingType();
    b.name = sheet[valCell]? sheet[valCell].v || "" : "";
    bIds.push(b.id);
    bNames.push(b.name);
    project.calcData.buildingTypes[b.id] = b;
  }
  
  buildingTypeParamDictionary.forEach(entry => {
    const sheet = workbook.Sheets[buildingTypeSheet];
    const keyCell = `${buildingTypeKeyCol}${entry.row}`;
    if (sheet[keyCell] && sheet[keyCell].v === entry.key) {
      for (let i = 0; i < numBuildingTypes; i++) {
        const valCell = `${intToChar(firstValueColIndex+i)}${entry.row}`
        if (sheet[valCell]) {
          const bId = bIds[i];
          _.set(project.calcData.buildingTypes[bId], entry.localPath, sheet[valCell].v);
        }
       
      }
    }
  });
  
  // add base case renovation measures
  // remove placeholder building measures
  for (const category in project.calcData.buildingMeasures) {
    for (const key in project.calcData.buildingMeasures[category as TBuildingMeasureCategory]) {
      delete project.calcData.buildingMeasures[category as TBuildingMeasureCategory][key];
      for (let i = 0; i < numBuildingTypes; i++) {
        const measureId = `${bIds[i]}-ref`;
        project.calcData.buildingMeasures[category as TBuildingMeasureCategory][measureId] = createBuildingMeasure(category as TBuildingMeasureCategory, measureId);
        project.calcData.buildingMeasures[category as TBuildingMeasureCategory][measureId].measureName = `${bNames[i]} (reference case)`;
      }
    }
  }

  // add information from building type sheet
  referenceCaseParamDictionary.forEach(entry => {
    const sheet = workbook.Sheets[buildingTypeSheet];
    const keyCell = `${buildingTypeKeyCol}${entry.row}`;
    if (sheet[keyCell] && sheet[keyCell].v === entry.key) {
      for (let i = 0; i < numBuildingTypes; i++) {
        const valCell = `${intToChar(firstValueColIndex+i)}${entry.row}`
        if (sheet[valCell]) {
          const mId = `${bIds[i]}-ref`;
          _.set(project.calcData.buildingMeasures[entry.category as TBuildingMeasureCategory][mId], entry.localPath, sheet[valCell].v);
        }
      }
    }
  });

  // add cost information from reference case sheet
  refCaseCostParamDictionary.forEach(entry => {
    const sheet = workbook.Sheets[refCaseSheet];
    const keyCell = `${refCaseKeyCol}${entry.row}`;
    const valCell = `${intToChar(refCaseFirstValueColIndex)}${entry.row}`;
    if (sheet[keyCell] && sheet[keyCell].v === entry.key) {
      for (const mId in project.calcData.buildingMeasures[entry.category as TBuildingMeasureCategory]) {
        if (sheet[valCell]) {
          _.set(project.calcData.buildingMeasures[entry.category as TBuildingMeasureCategory][mId], entry.localPath, sheet[valCell].v);
        }
      }
    }
  });

  // possibly todo: add renovation scenarios from reference case sheet

  // add energyCarriers
  // remove placeholder energyCarriers
  for (const key in project.calcData.energyCarriers) {
    delete project.calcData.energyCarriers[key];
  }

  const numEnergyCarriers = getNumEnergyCarriers(workbook, energyCarrierSheet, energyCarrierFirstValueRow, energyCarrierNameCol, energyCarrierKeyAfterLastKey);
  let ecIds: string[] = [];
  for (let i = 0; i < numEnergyCarriers; i++) {
    const sheet = workbook.Sheets[energyCarrierSheet];
    const valCell = `${energyCarrierNameCol}${energyCarrierFirstValueRow+i}`;
    const ec = new EnergyCarrier();
    ec.name = sheet[valCell]? sheet[valCell].v || "" : "";
    ecIds.push(ec.id);
    project.calcData.energyCarriers[ec.id] = ec;
  }

  energyCarrierParamDictionary.forEach(entry => {
    const sheet = workbook.Sheets[energyCarrierSheet];
    const keyCell = `${entry.col}${energyCarrierKeyRow}`;
    if (sheet[keyCell] && sheet[keyCell].v === entry.key) {
      for (let i = 0; i < numEnergyCarriers; i++) {
        const valCell = `${entry.col}${energyCarrierFirstValueRow+i}`
        if (sheet[valCell]) {
          const ecId = ecIds[i];
          _.set(project.calcData.energyCarriers[ecId], entry.localPath, sheet[valCell].v);
        }
      }
    }
  });
  console.log(project);
}

const getNumBuildingTypes = (workbook: WorkBook, sheet: string, firstCol: string, row: number) => {
  let i = 0;
  while (i < config.MAX_BUILDING_TYPES) {
    const cellName = `${intToChar(firstValueColIndex+i)}${row}`;
    if (!workbook.Sheets[sheet][cellName]) {
      return i;
    }
    i++;
  }
  throw new Error(`Project could not be added from workbook: max ${config.MAX_BUILDING_TYPES} building types is allowed`);
}

// goes through values in the column until the value is === last
const getNumEnergyCarriers = (workbook: WorkBook, sheet: string, firstRow: number, col: string, last: string) => {
  let i = 0;
  while (i < config.MAX_ENERGY_CARRIERS) {
    const cellName = `${col}${firstRow+i}`;
    if (workbook.Sheets[sheet][cellName] && workbook.Sheets[sheet][cellName].v === last) {
      return i;
    }
    i++;
  }
  throw new Error(`Project could not be added from workbook: max ${config.MAX_ENERGY_CARRIERS} energy carriers is allowed`);
}



const dictionary: IWorkbookEntry[] = [
  {
    sheet: "cover_page",
    keyCell: "A16",
    valueCell: "B16",
    key: "Country",
    path: "calcData.district.location.country.country"
  },{
    sheet: "cover_page",
    keyCell: "A17",
    valueCell: "B17",
    key: "Organisation filling in this template",
    path: "overviewData.contactInfo.affiliation"
  },{
    sheet: "cover_page",
    keyCell: "A18",
    valueCell: "B18",
    key: "Name of person filling in this template",
    path: "overviewData.contactInfo.name"
  },{
    sheet: "cover_page",
    keyCell: "A20",
    valueCell: "B20",
    key: "Telephone number of person responsible",
    path: "overviewData.contactInfo.phone"
  },{
    sheet: "cover_page",
    keyCell: "A21",
    valueCell: "B21",
    key: "E-mail address of person responsible",
    path: "overviewData.contactInfo.email"
  },{
    sheet: "01_district",
    keyCell: "A5",
    valueCell: "C5",
    key: "Location",
    path: "calcData.district.location.place"
  },{
    sheet: "01_district",
    keyCell: "A6",
    valueCell: "C6",
    key: "Latitude",
    path: "calcData.district.location.lat"
  },{
    sheet: "01_district",
    keyCell: "A7",
    valueCell: "C7",
    key: "Longitude",
    path: "calcData.district.location.lon"
  },{
    sheet: "01_district",
    keyCell: "A8",
    valueCell: "C8",
    key: "Climate zone",
    path: "calcData.district.climate.zone"
  },{
    sheet: "01_district",
    keyCell: "A10",
    valueCell: "C10",
    key: "Required piping length",
    path: "calcData.district.geometry.pipingLength"
  },{
    sheet: "01_district",
    keyCell: "A17",
    valueCell: "C17",
    key: "Distance to closest district heating network connection",
    path: "calcData.district.geometry.distanceToDistrictHeatingNetwork"
  },{
    sheet: "01_district",
    keyCell: "A19",
    valueCell: "C19",
    key: "Area available for additional solar panels",
    path: "calcData.district.geometry.solarPanelArea"
  },{
    sheet: "01_district",
    keyCell: "A20",
    valueCell: "C20",
    key: "Available heat sources/sinks",
    path: "calcData.district.energy.heatSources"
  },{
    sheet: "01_district",
    keyCell: "A21",
    valueCell: "C21",
    key: "Possibility for ground source heat pumps",
    path: "calcData.district.energy.gshpArea",
  }
];

const buildingTypeNameCell = {
  row: 4,
  key: "Parameter ", // note space at the end!!!
  localPath: "name",
}

const buildingTypeParamDictionary: IBuildingTypeWorkbookEntry[] = [
  {
    row: 7,
    key: "Construction period",
    localPath: "buildingInformation.constructionYear",
  },{
    row: 8,
    key: "Energy performance certificate",
    localPath: "buildingInformation.energyPerformanceCertificate",
  },{
    row: 9,
    key: "Ownership",
    localPath: "buildingInformation.ownership",
  },{
    row: 12,
    key: "Gross heated floor area (GHFA)",
    localPath: "buildingGeometry.grossFloorArea",
  },{
    row: 13,
    key: "Heated volume",
    localPath: "buildingGeometry.heatedVolume",
  },{
    row: 14,
    key: "Façade area to North",
    localPath: "buildingGeometry.facadeAreaN",
  },{
    row: 15,
    key: "Façade area to east",
    localPath: "buildingGeometry.facadeAreaE",
  },{
    row: 16,
    key: "Façade area to South",
    localPath: "buildingGeometry.facadeAreaS",
  },{
    row: 17,
    key: "Façade area to West",
    localPath: "buildingGeometry.facadeAreaW",
  },{
    row: 19,
    key: "Roof area if flat roof",
    localPath: "buildingGeometry.roofArea",
  },{
    row: 23,
    key: "Area of windows to North",
    localPath: "buildingGeometry.windowAreaN",
  },{
    row: 24,
    key: "Area of windows to East",
    localPath: "buildingGeometry.windowAreaE",
  },{
    row: 25,
    key: "Area of windows to South",
    localPath: "buildingGeometry.windowAreaS",
  },{
    row: 26,
    key: "Area of windows to West",
    localPath: "buildingGeometry.windowAreaW",
  },{
    row: 27,
    key: "Area of basement ceiling",
    localPath: "buildingGeometry.basementFloorArea",
  },{
    row: 34,
    key: "Average room height",
    localPath: "buildingGeometry.floorHeight",
  },{
    row: 35,
    key: "Number of floors above ground",
    localPath: "buildingGeometry.numberOfFloorsAbove",
  },{
    row: 36,
    key: "Number of floors below ground",
    localPath: "buildingGeometry.numberOfFloorsBelow",
  },{
    row: 43,
    key: "Building class (light, medium, heavy, etc.)",
    localPath: "buildingInformation.buildingClass",
  },
]

const referenceCaseParamDictionary: IRenovationMeasureWorkbookEntry[] = [
  {
    row: 44,
    key: "U-value façade",
    category: "facade",
    localPath: "uValue",
  },{
    row: 45,
    key: "U-value roof",
    category: "roof",
    localPath: "uValue",
  },{
    row: 46,
    key: "U-value windows",
    category: "windows",
    localPath: "uValue",
  },{
    row: 47,
    key: "g-value windows",
    category: "windows",
    localPath: "gValue",
  },{
    row: 48,
    key: "U-value foundation",
    category: "foundation",
    localPath: "foundationUValue",
  },{
    row: 50,
    key: "U-value basement wall",
    category: "foundation",
    localPath: "basementWallUValue",
  },{
    row: 55,
    key: "Efficiency of heat recovery ", // note space at end!!
    category: "hvac",
    localPath: "recoveryEfficiency",
  },{
    row: 57,
    key: "Cold water temperature",
    category: "hvac",
    localPath: "coldWaterTemp",
  },{
    row: 58,
    key: "Hot water temperature",
    category: "hvac",
    localPath: "hotWaterTemp",
  },{
    row: 60,
    key: "Ventilation rate",
    category: "hvac",
    localPath: "ventilationRate",
  },{
    row: 61,
    key: "Type of heating system (boiler, heat pump, etc.)",
    category: "hvac",
    localPath: "heatingType",
  },{
    row: 62,
    key: "Energy carrier (Gas, Electricity, etc.)",
    category: "hvac",
    localPath: "energyCarrier",
  },{
    row: 64,
    key: "Efficiency of heating system ", // note space at end!!
    category: "hvac",
    localPath: "efficiency",
  },
];

const refCaseCostParamDictionary: IRenovationMeasureWorkbookEntry[] = [
  {
    row: 6,
    key: "Façade renovation without energy performance improvement",
    category: "facade",
    localPath: "renovationCost",
  },{
    row: 8,
    key: "Flat roof renovation, without energy performance improvement",
    category: "roof",
    localPath: "renovationCost",
  },{
    row: 11,
    key: "Windows (repainting and repairing only, without energy performance improvement",
    category: "windows",
    localPath: "renovationCost",
  },{
    row: 17,
    key: "Cellar ceiling renovation",
    category: "foundation",
    localPath: "renovationCost",
  },{
    row: 19,
    key: "Replacement of energy system",
    category: "hvac",
    localPath: "renovationCost",
  },
];

interface IEnergyCarrierParamWorkbookEntry {
  col: string;
  key: string;
  localPath: string;
}

const energyCarrierParamDictionary: IEnergyCarrierParamWorkbookEntry[] = [
  {
    col: "B",
    key: "Carbon emissions",
    localPath: "emissionFactor",
  },{
    col: "C",
    key: "Primary energy (Non-RE)",
    localPath: "primaryEnergyFactorNonRe",
  },{
    col: "D",
    key: "Primary energy (RE)",
    localPath: "primaryEnergyFactorRe",
  },{
    col: "E",
    key: "Current price for end consumers with taxation ",
    localPath: "currentPrice",
  },
];

// these are the sheet names we expect to find
const sheets = [
  "cover_page",
  "01_district",
  "04_building_typology",
  "05_reference_case_typology",
  "08_energy_carriers",
];

const SUPPORTED_VERSIONS = [ "1.0.0" ];
const versionCell: IWorkbookEntry = {
  sheet: "cover_page",
  valueCell: "B24",
}

// todo: implement further validation
const validateWorkbook = (workbook: WorkBook) => {
  const requiredSheets = sheets.every(i => workbook.SheetNames.includes(i));
  const supportedVersion = SUPPORTED_VERSIONS.includes(workbook.Sheets[versionCell.sheet][versionCell.valueCell].v);
  return requiredSheets && supportedVersion;
}