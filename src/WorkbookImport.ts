// external
import { WorkBook } from 'xlsx';
import _ from 'lodash';//{ set as _fpSet } from 'lodash/fp';

// internal
import { Project, BuildingType } from "./types";

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

const charToInt = (c: string) => {
  return c.toLowerCase().charCodeAt(0) - 96;
}

const intToChar = (i: number) => {
  return String.fromCharCode(i+96).toUpperCase();
}

const supportedAppVersions = [ "0.2.6-0", ];

const buildingTypeSheet = "04_building_typology";
const buildingTypeKeyCol = "A";
const buildingTypeFirstValueCol = "E";
const firstValueColIndex = charToInt(buildingTypeFirstValueCol);
const buildingTypeMandatoryRow = 6;

export const updateFromWorkbook = (project: Project, workbook: WorkBook) => {
  if (!validateWorkbook(workbook)) {
    throw new Error( "Project could not be added from workbook: workbook is invalid");
  }
  if (!supportedAppVersions.includes(project.appVersion)) {
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
  const bIds: string[] = [];
  for (let i = 0; i < numBuildingTypes; i++) {
    const b = new BuildingType();
    bIds.push(b.id);
    project.calcData.buildingTypes[b.id] = b;
  }
  console.log(bIds);
  buildingTypeParamDictionary.forEach(entry => {
    const sheet = workbook.Sheets[buildingTypeSheet];
    const keyCell = `${buildingTypeKeyCol}${entry.row}`;
    if (sheet[keyCell].v === entry.key) {
      for (let i = 0; i < numBuildingTypes; i++) {
        const valCell = `${intToChar(firstValueColIndex+i)}${entry.row}`
        if (sheet[valCell]) {
          const bId = bIds[i];
          _.set(project.calcData.buildingTypes[bId], entry.localPath, sheet[valCell].v);
        }
       
      }
    }
  })

  // add energyCarriers
}

const getNumBuildingTypes = (workbook: WorkBook, sheet: string, firstCol: string, row: number) => {
  let i = 0;
  while (true) {
    const cellName = `${intToChar(firstValueColIndex+i)}${row}`;
    if (!workbook.Sheets[sheet][cellName]) {
      return i;
    }
    i++;
  }
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

const buildingTypeParamDictionary: IBuildingTypeWorkbookEntry[] = [
  {
    row: 4,
    key: "Parameter ", // note space at the end!!!
    localPath: "name",
  },{
    row: 7,
    key: "Construction period",
    localPath: "buildingInformation.constructionYear",
  }
]

// these are the sheet names we expect to find
const sheets = [
  "cover_page",
  "01_district",
  "04_building_typology",
  "05_reference_case_typology",
  "08_energy_carriers",
]

const SUPPORTED_VERSIONS = [ "1.0.0" ];
const versionCell: IWorkbookEntry = {
  sheet: "cover_page",
  valueCell: "B24",
}

// todo: implement
const validateWorkbook = (workbook: WorkBook) => {
  const requiredSheets = sheets.every(i => workbook.SheetNames.includes(i));
  const supportedVersion = SUPPORTED_VERSIONS.includes(workbook.Sheets[versionCell.sheet][versionCell.valueCell].v);
  return requiredSheets && supportedVersion;
}