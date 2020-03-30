// external
import { WorkBook } from 'xlsx';
import _ from 'lodash';//{ set as _fpSet } from 'lodash/fp';

// internal
import { Project } from "./types";

interface IWorkbookEntry {
  sheet: string;
  keyCell?: string;
  valueCell: string;
  key?: string;
  path?: string;
}

const supportedAppVersions = [ "0.2.6-0", ];

export const updateFromWorkbook = (project: Project, workbook: WorkBook) => {
  console.log(project);
  console.log(workbook);
  if (!validateWorkbook(workbook)) {
    throw new Error( "Project could not be added from workbook: workbook is invalid");
  }
  if (!supportedAppVersions.includes(project.appVersion)) {
    throw new Error( "Project could not be added from workbook: app version is not supported");
  }
  // add simple parameters
  dictionary.forEach(entry => {
    const sheet = workbook.Sheets[entry.sheet]
    if(
      sheet[entry.keyCell!].v === entry.key
      && (sheet[entry.valueCell].v || sheet[entry.valueCell].v === 0)
    ) {
      _.set(project, entry.path!, String(sheet[entry.valueCell].v));
    }
  });

  // add buildingTypes

  // add energyCarriers
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