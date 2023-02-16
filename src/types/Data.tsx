// external
import { v4 as uuidv4 } from 'uuid';

// internal
import { EnergySystem, TCostCurveType, printableEnergySystemData } from './classes/EnergySystem';
import { IEnergySystemScenarioInfo, IBuildingMeasureScenarioInfo } from '../calculation-model/calculate';

// this module defines data containers

/* Strings representing units */
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
  deg = "°",
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
  meterSqPerPerson = "m²/person",
  kiloGramCO2Eq = "kg CO₂eq",
  kiloGramCO2EqPerKiloWattHour = "kg CO₂eq/kWh",
  kiloGramCO2EqPerYear = "kg CO₂eq/a",
  kiloGramCO2EqPerCentimeterMeterSq = "kg CO₂eq/(cm, m²)",
  kiloGramCO2EqPerMeterSq = "kg CO₂eq/m²",
}

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

type TPrintLevel = "p" | "h2" | "h3" | "h4" | "h5";

export interface IPrintableData {
  name: string; // readable string representing the data point
  value?: string | number;
  unit?: string;
  level?: TPrintLevel;
}

// todo: this whole chain of functions badly need refactoring. it's gonna be awful to maintain
export const printableProjectData = (project: IProject): IPrintableData[] => {
  return [
    ...printableCalcData(project.calcData),
    ...printableScenariosData(project.scenarioData, project.calcData),
  ]
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
    aboutTxt: string = "";

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

const printableCalcData = (calcData: CalcData): IPrintableData[] => {
  return [    
    {
      level: "h2",
      name: "Calculation data",
    },
    ...printableDistrictData(calcData.district),
    ...printableBuildingTypesData(calcData.buildingTypes),
    ...printableEnergySystemsData(calcData.energySystems),
    ...printableEnergyCarriersData(calcData.energyCarriers),
    ...printableBuildingMeasuresData(calcData.buildingMeasures),
  ]
}

export class District {
  // location information
  location: Location = new Location();
  climate = new Climate();
  geometry: DistrictGeometry = new DistrictGeometry();
  energy: DistrictEnergy = new DistrictEnergy();
  //economy: DistrictEconomy = new DistrictEconomy(); // should this possibly be in Country?
}

const printableDistrictData = (district: District): IPrintableData[] => {
  return [{
      name: "District information",
      level: "h3",
    },
    ...printableLocationData(district.location),
    ...printableClimateData(district.climate),
    ...printableDistrictGeometryData(district.geometry),
    ...printableDistrictEnergyData(district.energy),
  ]
}

export class Location {
  country: Country = new Country();
  place: string = "";
  lat: number = 0;
  lon: number = 0;
  altitude: number = 0;
}

const printableLocationData = (location: Location) => {
  return [
    ...printableCountryData(location.country),
    {
      name: "Latitude",
      value: location.lat,
      unit: Units.deg,
    },{
      name: "Longitude",
      value: location.lon,
      unit: Units.deg,
    },{
      name: "Altitude",
      value: location.altitude,
      unit: Units.meter,
    },
  ]
}

export class Country {
  country: string = "";
}

const printableCountryData = (country: Country): IPrintableData[] => {
  return [
    {
      name: "Country",
      value: country.country,
      unit: "",
    },
  ]
}

export class Climate {
  zone: string = "";
  designOutdoorTemperature: number = 0;
  filename: string = "";
}

const printableClimateData = (climate: Climate): IPrintableData[] => {
  return [
    {
      name: "Climate zone",
      value: climate.zone,
      unit: "",
    },{
      name: "Design outdoor temperature",
      value: climate.designOutdoorTemperature,
      unit: Units.degC,
    },
  ]
}

export class DistrictGeometry {
  pipingLength: number = 0;
  //distanceToDistrictHeatingNetwork: number = 0;
  solarPanelArea: number = 0;
}

const printableDistrictGeometryData = (geometry: DistrictGeometry): IPrintableData[] => {
  return [
    {
      name: "Piping length",
      value: geometry.pipingLength,
      unit: Units.meter,
    },{
      name: "Solar panel area",
      value: geometry.solarPanelArea,
      unit: Units.meterSq,
    },
  ]
}

export class DistrictEnergy {
  heatSources: string = ""; // what should this be?
  gshpArea: number = 0; // is this a useful way of quantifying this?
}

const printableDistrictEnergyData = (energy: DistrictEnergy): IPrintableData[] => {
  return [
    {
      name: "Available heat sources",
      value: energy.heatSources,
      unit: "",
    },{
      name: "Available area for ground source heat pumps",
      value: energy.gshpArea,
      unit: Units.meterSq,
    },
  ]
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

const printableBuildingTypesData = (buildingTypes: IDictBuildingType): IPrintableData[] => {
  const buildingTypesData: IPrintableData[] = [
    {
      name: "Building types",
      level: "h3",
    },
  ]

  for (const buildingType of Object.values(buildingTypes)) {
    buildingTypesData.push(...printableBuildingTypeData(buildingType));
  }
  
  return buildingTypesData;
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

const printableBuildingTypeData = (buildingType: BuildingType): IPrintableData[] => {
  return [
    {
      name: buildingType.name,
      level: "h4",
    },
    ...printableBuildingInformation(buildingType.buildingInformation),
    ...printableBuildingGeometry(buildingType.buildingGeometry),
    ...printableBuildingThermalProperties(buildingType.buildingThermalProperties),
  ]
}

export class BuildingInformation {
  constructionYear: number = 1970;
  //energyPerformanceCertificate: string = "";
  //ownership: string = "";
  [key: string]: BuildingInformation[keyof BuildingInformation];
}

const printableBuildingInformation = (buildingInformation: BuildingInformation): IPrintableData[] => {
  return [
    {
      name: "Construction year",
      unit: "",
      value: buildingInformation.constructionYear,
    },
  ]
}

export class BuildingGeometry {
  grossFloorArea: number = 0;
  /* todo: implement the data like this:
  grossFloorArea: BuildingGeometryData = {
    value: 0,
    unit: Units.meterSq,
    name: "Gross floor area",
  },
  */
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

const printableBuildingGeometry = (buildingGeometry: BuildingGeometry):IPrintableData[] => {
  return [
    {
      name: "Gross floor area",
      unit: Units.meterSq,
      value: buildingGeometry.grossFloorArea,
    },{
      name: "Heated volume",
      unit: Units.meterCubed,
        value: buildingGeometry.heatedVolume
     },{
      name: "Perimeter",
      unit: Units.meter,
        value: buildingGeometry.perimeter,
    },{
      name: "Façade area facing NW-NE",
      unit: Units.meterSq,
      value: buildingGeometry.facadeAreaN,
    },{
      name: "Façade area facing NE-SE",
      unit: Units.meterSq,
      value: buildingGeometry.facadeAreaE,
    },{
      name: "Façade area facing SE-SW",
      unit: Units.meterSq,
      value: buildingGeometry.facadeAreaS,
    },{
      name: "Façade area facing SW-NW",
      unit: Units.meterSq,
      value: buildingGeometry.facadeAreaW,
    },{
      name: "Window area facing NW-NE",
      unit: Units.meterSq,
      value: buildingGeometry.windowAreaN,
    },{
      name: "Window area facing NE-SE",
      unit: Units.meterSq,
      value: buildingGeometry.windowAreaE,
    },{
      name: "Window area facing SE-SW",
      unit: Units.meterSq,
      value: buildingGeometry.windowAreaS,
    },{
      name: "Window area facing SW-NW",
      unit: Units.meterSq,
      value: buildingGeometry.windowAreaW,
    },{
      name: "Roof area",
      unit: Units.meterSq,
      value: buildingGeometry.roofArea,
    },{
      name: "Foundation area",
      unit: Units.meterSq,
      value: buildingGeometry.basementFloorArea,
    },{
      name: "Basement wall area",
      unit: Units.meterSq,
      value: buildingGeometry.basementWallArea,
    },{
      name: "Number of floors above ground",
      unit: "",
      value: buildingGeometry.numberOfFloorsAbove,
    },{
      name: "Number of floors below ground",
      unit: "",
      value: buildingGeometry.numberOfFloorsBelow,
    },{
      name: "Storey height",
      unit: Units.meter,
      value: buildingGeometry.floorHeight,
    },
  ]
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

const printableBuildingThermalProperties = (buildingThermalProperties: BuildingThermalProperties): IPrintableData[] => {
  return [
    {
      name: "Building thermal mass",
      unit: Units.none,
      value: buildingThermalProperties.buildingClass,
    },{
      name: "Façade original U-value",
      unit: Units.wattPerMeterSqKelvin,
      value: buildingThermalProperties.facadeUValue,
    },{
      name: "Window original U-value",
      unit: Units.wattPerMeterSqKelvin,
      value: buildingThermalProperties.windowUValue,
    },{
      name: "Roof original U-value",
      unit: Units.wattPerMeterSqKelvin,
      value: buildingThermalProperties.roofUValue,
    },{
      name: "Basement wall original U-value",
      unit: Units.wattPerMeterSqKelvin,
      value: buildingThermalProperties.basementWallUValue,
    },{
      name: "Foundation original U-value",
      unit: Units.wattPerMeterSqKelvin,
      value: buildingThermalProperties.foundationUValue,
    },{
      name: "Design indoor air temperature",
      unit: Units.degC,
      value: buildingThermalProperties.designIndoorTemperature,
    },
  ]
}/* modify in scenarios?
export class BuildingOccupancy {
  occupancy: string = "";
  occupants: number = 0;
  [key: string]: BuildingOccupancy[keyof BuildingOccupancy];
}
*/

export interface IDictEnergySystem {
  [index: string]: EnergySystem;
}

const printableEnergySystemsData = (energySystems: IDictEnergySystem): IPrintableData[] => {
  const energySystemsData: IPrintableData[] = [
    {
      name: "Energy systems",
      level: "h3",
    },
  ]

  for (const energySystem of Object.values(energySystems)) {
    energySystemsData.push(...printableEnergySystemData(energySystem));
  }
  
  return energySystemsData;
}

export interface IDictEnergyCarrier {
  [index: string]: EnergyCarrier;
}

const printableEnergyCarriersData = (energyCarriers: IDictEnergyCarrier): IPrintableData[] => {
  const energyCarriersData: IPrintableData[] = [
    {
      name: "Energy carriers",
      level: "h3",
    },
  ];

  for (const energyCarrier of Object.values(energyCarriers)) {
    energyCarriersData.push(...printableEnergyCarrierData(energyCarrier));
  }

  return energyCarriersData;
}

export class EnergyCarrier {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  //primaryEnergyFactorRe: number = 0;
  //primaryEnergyFactorNonRe: number = 0;
  primaryEnergyFactorTotal: number = 0;
  emissionFactor: number = 0;
  currentPrice: number = 0;
  projectedPrice: number = 0;
  deleted: boolean = false;
  [key: string]: EnergyCarrier[keyof EnergyCarrier];
}

const printableEnergyCarrierData = (energyCarrier: EnergyCarrier): IPrintableData[] => {
  return [
    {
      name: energyCarrier.name,
      level: "h4",
    },{
      name: "Primary energy factor",
      unit: Units.kiloWattHourPerKiloWattHour,
      value: energyCarrier.primaryEnergyFactorTotal,
    },{
      name: "Emission factor",
      unit: Units.kiloGramCO2EqPerKiloWattHour,
      value: energyCarrier.emissionFactor,
    },{
      name: "Current price",
      unit: Units.euroPerKiloWattHour,
      value: energyCarrier.currentPrice,
    },{
      name: "Projected price in 2030",
      unit: Units.euroPerKiloWattHour,
      value: energyCarrier.projectedPrice,
    }
  ]
}

export interface IDictBuildingMeasure {
  [index: string]: IBuildingMeasure;
}

const printableBuildingMeasuresData = (buildingMeasures: Record<TBuildingMeasureCategory,IDictBuildingMeasure>): IPrintableData[] => {
  const buildingMeasuresData: IPrintableData[] = [
    {
      name: "Building measures",
      level: "h3",
    },
    ...printableEnvelopeMeasuresData(buildingMeasures.insulation),
    ...printableWindowMeasuresData(buildingMeasures.windows),
    ...printableHvacMeasuresData(buildingMeasures.hvac),
  ]
  
  return buildingMeasuresData;
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
  embodiedEmissions: number;
  deleted: boolean;
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
  embodiedEmissions: number = 0;
  deleted: boolean = false;
}

const printableBuildingMeasureData = (buildingMeasure: BaseBuildingMeasure): IPrintableData[] => {
  
  const units = {
    "hvac": {
      cost: Units.euro,
      embodiedEmissions: Units.kiloGramCO2Eq,
    },
    "windows": {
      cost: Units.euroPerMeterSq,
      embodiedEmissions: Units.kiloGramCO2EqPerMeterSq,
    },
    "insulation": {
      cost: Units.euroPerCentimeterMeterSq,
      embodiedEmissions: Units.kiloGramCO2EqPerCentimeterMeterSq,
    }
  };

  const buildingMeasureData: IPrintableData[] = [
    {
      name: buildingMeasure.measureName,
      level: "h4",
    },{
      name: "Renovation cost",
      unit: units[buildingMeasure.category].cost,
      value: buildingMeasure.renovationCost,
    },{
      name: "Reference life time",
      unit: Units.years,
      value: buildingMeasure.lifeTime,
    },{
      name: "Embodied emissions",
      unit: units[buildingMeasure.category].embodiedEmissions,
      value: buildingMeasure.embodiedEmissions,
    },
  ];

  return buildingMeasureData;
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

const printableEnvelopeMeasuresData = (envMeasures: IDictBuildingMeasure): IPrintableData[] => {
  const envelopeMeasuresData: IPrintableData[] = [
    {
      name: "Envelope measures",
      level: "h3",
    },
  ];

  for (const envMeasure of Object.values(envMeasures)) {
    envelopeMeasuresData.push(...printableEnvelopeMeasureData(envMeasure as EnvelopeMeasure));
    
  }
  
  return envelopeMeasuresData;
}

const printableEnvelopeMeasureData = (envMeasure: EnvelopeMeasure): IPrintableData[] => {
  const envelopeMeasureData: IPrintableData[] = [
    ...printableBuildingMeasureData(envMeasure),
    {
      name: "Thermal conductivity",
      value: envMeasure.lambdaValue,
      unit: Units.wattPerMeterKelvin,
    },
  ];
  
  return envelopeMeasureData;
}

export class WindowMeasure extends BaseBuildingMeasure {  
  uValue: number = 0;
  gValue: number = 0;

  [key: string]: WindowMeasure[keyof WindowMeasure];
}

const printableWindowMeasuresData = (winMeasures: IDictBuildingMeasure): IPrintableData[] => {
  const windowMeasuresData: IPrintableData[] = [
    {
      name: "Window measures",
      level: "h3",
    },
  ];
  
  for (const winMeasure of Object.values(winMeasures)) {
    windowMeasuresData.push(...printableWindowMeasureData(winMeasure as WindowMeasure));
    
  }
  
  return windowMeasuresData;
}

const printableWindowMeasureData = (winMeasure: WindowMeasure): IPrintableData[] => {
  const windowMeasureData: IPrintableData[] = [
    ...printableBuildingMeasureData(winMeasure),
    {
      name: "U-value",
      value: winMeasure.uValue,
      unit: Units.wattPerMeterSqKelvin,
    },{
      name: "g-value",
      value: winMeasure.gValue,
      unit: Units.nonDimensional,
    },
  ];
  
  return windowMeasureData;
}


export class HvacMeasure extends BaseBuildingMeasure {  
  ventilationType: string = "";
  //coolingType: string = "None";
  //heatingType: string = "None";
  //energyCarrier: string = "";
  efficiency: number = 0;
  recoveryEfficiency: number = 0;
  coldWaterTemp: number = 15;
  hotWaterTemp: number = 80;
  ventilationRate: number = 0.5;

  [key: string]: HvacMeasure[keyof HvacMeasure];
}

const printableHvacMeasuresData = (hvacMeasures: IDictBuildingMeasure): IPrintableData[] => {
  const hvacMeasuresData: IPrintableData[] = [
    {
      name: "HVAC measures",
      level: "h3",
    },
  ];
  
  for (const hvacMeasure of Object.values(hvacMeasures)) {
    hvacMeasuresData.push(...printableHvacMeasureData(hvacMeasure as HvacMeasure));
    
  }
  
  return hvacMeasuresData;
}

const printableHvacMeasureData = (hvacMeasure: HvacMeasure): IPrintableData[] => {
  const hvacMeasureData: IPrintableData[] = [
    ...printableBuildingMeasureData(hvacMeasure),
    {
      name: "",
      unit: Units.none,
      value: hvacMeasure.ventilationType,
    },/*{
      name: "",
      unit: Units.none,
      value: hvacMeasure.coolingType,
    },{
      name: "",
      unit: Units.none,
      value: hvacMeasure.heatingType,
    },{
      name: "",
      unit: Units.none,
      value: hvacMeasure.energyCarrier,
    },*/{
      name: "Efficiency",
      unit: Units.nonDimensional,
      value: hvacMeasure.efficiency,
    },{
      name: "Recovery efficiency",
      unit: Units.nonDimensional,
      value: hvacMeasure.recoveryEfficiency,
    },{
      name: "Water return temperature",
      unit: Units.degC,
      value: hvacMeasure.coldWaterTemp,
    },{
      name: "Hot water temperature",
      unit: Units.degC,
      value: hvacMeasure.hotWaterTemp,
    },{
      name: "Air change rate",
      unit: Units.airChangesHourly,
      value: hvacMeasure.ventilationRate,
    },
  ]
  
  return hvacMeasureData;
}

export class ScenarioData {
  scenarios: Record<string, Scenario> = {};
}

const printableScenariosData = (scenarioData: ScenarioData, calcData: CalcData): IPrintableData[] => {
  const scenariosData: IPrintableData[] = [
    {
      level: "h2",
      name: "Scenario data",
    },
  ];

  for (const scenario of Object.values(scenarioData.scenarios)) {
    scenariosData.push(...printableScenarioData(scenario, calcData));
  }

  return scenariosData;
}

export interface IBuildingMeasureResult {
  renovationCost: number;
  embodiedEmissions: number;
}

export interface IResultSummary {
  specificEmbodiedEmissions: number; // [kgCO2eq/m2]
  annualizedSpecificCost: number; // [€/m2a]
  buildingArea: number; // [m2]
  heatingNeed: number; // [kWh]
  decentralizedSystemSize: number; // [kW]
  centralizedSystemSize: number; // [kW]
  energySystems: {
    investmentCost: Record<TCostCurveType, number>;
    maintenanceCost: Record<TCostCurveType, number>;
    embodiedEmissions: Record<TCostCurveType, number>;
  };
  buildingMeasures: Record<TBuildingMeasureScenarioCategory,IBuildingMeasureResult>;
  // specificGHGEmissions: number; // todo: implement
  // annualizedSpecificInvestmentCost: number;
  // specificMaintenanceCost: number;
  [key: string]: IResultSummary[keyof IResultSummary];
}

export class ResultSummary implements IResultSummary {
  specificEmbodiedEmissions: number = 0;
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
    embodiedEmissions: { intake: 0, generation: 0, circulation: 0, substation: 0, },
  };
  buildingMeasures = {
    roof: { renovationCost: 0, embodiedEmissions: 0, },
    facade: { renovationCost: 0, embodiedEmissions: 0, },
    foundation: { renovationCost: 0, embodiedEmissions: 0, },
    windows: { renovationCost: 0, embodiedEmissions: 0, },
    hvac: { renovationCost: 0, embodiedEmissions: 0, },
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
    //energyPriceIncrease: 0,
    //calculationPeriod: 0,
  }
  energySystems: Record<string,IEnergySystemScenarioInfo> = { };
  buildingMeasures: Record<TBuildingMeasureScenarioCategory, Record<string, IBuildingMeasureScenarioInfo>> = {
    facade: { placeholder: { renovationCost: 0, embodiedEmissions: 0, }},
    roof: { placeholder: { renovationCost: 0, embodiedEmissions: 0, }},
    foundation: { placeholder: { renovationCost: 0, embodiedEmissions: 0, }},
    hvac: { placeholder: { renovationCost: 0, embodiedEmissions: 0, }},
    windows: { placeholder: { renovationCost: 0, embodiedEmissions: 0, }},
  };
  buildingTypes: Record<string, ScenarioInfo> = {}; 
  total: ResultSummary = new ResultSummary();
  deleted: boolean = false;
}

const printableScenarioData = (scenario: Scenario, calcData: CalcData): IPrintableData[] => {
  console.log(scenario)
  const scenarioData: IPrintableData[] = [
    {
      name: `Scenario: ${scenario.name}`,
      level: "h4",
    },{
      name: "Interest rate",
      unit: Units.percent,
      value: scenario.economy.interestRate,
    },/*{
      name: "",
      unit: Units.none,
      value: scenario.economy.energyPriceIncrease,
    },{
      name: "",
      unit: Units.none,
      value: scenario.economy.calculationPeriod,
    },*/
  ]

  for (const [id, scenarioInfo] of Object.entries(scenario.buildingTypes)) {
    const buildingName = calcData.buildingTypes[id].name;
    const buildingTypeData: IPrintableData[] = [
      {
        level: "h4",
        name: `Building type: ${buildingName}`,
      },{
        value: scenarioInfo.buildingType.numberOfBuildings,
        name: "Number of buildings of type",
        unit: Units.none,
      },{
        value: scenarioInfo.buildingType.heatingNeed,
        name: "Heating need (per building)",
        unit: Units.kiloWattHourPerYear,
      },{
        value: scenarioInfo.buildingType.occupancy,
        name: "Building use",
        unit: Units.none,
      },{
        value: scenarioInfo.buildingType.occupants,
        name: "Area per occupant",
        unit: Units.meterSqPerPerson,
      },{
        value: scenarioInfo.buildingType.setPointTemp,
        name: "Set point temperature",
        unit: Units.degC,
      },{
        value: scenarioInfo.buildingType.appliancesElectricityUsage,
        name: "Domestic electricity usage",
        unit: Units.kiloWattHourPerMeterSqYear,
      },{
        value: scenarioInfo.buildingType.domesticHotWaterUsage,
        name: "Domestic hot water usage",
        unit: Units.kiloWattHourPerMeterSqYear,
      },{
        name: "Energy system",
        value: calcData.energySystems[scenarioInfo.energySystem.energySystem].name,
      },{
        name: "Facade insulation measure",
        value: calcData.buildingMeasures.insulation[scenarioInfo.buildingMeasures.facade.id].measureName,
      },{
        name: "Facade insulation thickness",
        value: (scenarioInfo.buildingMeasures.facade as IScenarioEnvelopeMeasureData).thickness,
        unit: Units.centimeter,
      },{
        name: "Roof insulation measure",
        value: calcData.buildingMeasures.insulation[scenarioInfo.buildingMeasures.roof.id].measureName,
      },{
        name: "Roof insulation thickness",
        value: (scenarioInfo.buildingMeasures.roof as IScenarioEnvelopeMeasureData).thickness,
        unit: Units.centimeter,
      },{
        name: "Foundation insulation measure",
        value: calcData.buildingMeasures.insulation[scenarioInfo.buildingMeasures.foundation.id].measureName,
      },{
        name: "Basement wall insulation thickness",
        value: (scenarioInfo.buildingMeasures.foundation as IScenarioFoundationMeasureData).wallThickness,
        unit: Units.centimeter,
      },{
        name: "Basement/bottom floor insulation thickness",
        value: (scenarioInfo.buildingMeasures.foundation as IScenarioFoundationMeasureData).floorThickness,
        unit: Units.centimeter,
      },{
        name: "Window measure",
        value: calcData.buildingMeasures.windows[scenarioInfo.buildingMeasures.windows.id].measureName,
      },{
        name: "HVAC measure",
        value: calcData.buildingMeasures.hvac[scenarioInfo.buildingMeasures.hvac.id].measureName,
      },
    ];

    scenarioData.push(...buildingTypeData);
  }
  
  return scenarioData
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
  //energyPriceIncrease: number;
  //calculationPeriod: number;
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

export enum CostCurveLabels {
  cost = "Cost",
  emissions = "Emissions",
  systemSize = "System size",
  substation = "Substation",
  intake = "Intake",
  generation = "Generation",
  circulation = "Circulation",
}
