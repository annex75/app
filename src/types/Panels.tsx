import { IProject, District, IDictBuildingType, IDictEnergySystem, IDictBuildingMeasure, IDictEnergyCarrier, TBuildingMeasureCategory, IValidatorResult, IDictBool, Units } from "./Data";
import { ChangeEvent, ComponentType, ReactNode } from "react";
import { IDropdownAlt } from "../helpers";
import { TCostCurveCategory, TCostCurveScale, ICostCurveCategory, ICostCurveScale, ICostCurve, } from "./classes/EnergySystem";

/* Panels */

export interface IPanelProps {
  title: string;
  info: string;
}

export interface IPanelState { }

export interface IOverviewPanelProps extends IPanelProps {
  updateProject(project: IProject): void;
  title: string;
  project: IProject;
}

export interface IOverviewPanelState extends IPanelState {
  project: IProject;
  overviewDataCards: Record<string, IOverviewDataCard>;
}

export interface IOverviewDataCard {
  name: string;
  title: string;
  isOpen: boolean;
  info?: string;
  eventHandlers: IDictEventHandler;
  parameters: Record<string, IOverviewInfo>;
}

export type TInputType = StringConstructor | NumberConstructor | "file";

export interface IInput {
  key: string;
  disabled?: boolean;
  label: string;
  path?: string;
  info?: string;
}

export interface IInputField extends IInput {
  type: TInputType;
  unit?: keyof typeof Units;
  buttonLabel?: string;
  localPath?: string;
  rootPath?: string;
  handleChange?(e: ChangeEvent<HTMLInputElement>): void;
}

export interface IDropdown extends IInput {
  handleChange?(e: ChangeEvent<HTMLInputElement>): void;
  localPath?: string;
  twoLine?: boolean;
}

// dropdown which retrieves options from the object
export interface IDropdownOptionPath extends IDropdown {
  optionPath: string; // where to get possible values
}

// dropdown which retrieves options from the object
export interface IDropdownOptions extends IDropdown {
  options: IDropdownAlt[]; // where to get possible values
}


export interface IOverviewInfo extends IInputField {

}

type TEventHandler = 
  ((e: React.ChangeEvent<HTMLInputElement>) => void)
  | ((path: string, value: any) => void)
  | ((category: TBuildingMeasureCategory) => void)
  | ((e: React.MouseEvent<HTMLElement>) => void)
  | ((item: IDropdownAlt) => void)

// todo: a bit ugly that we are not type checking here. but it was the only way I managed to allow both events and string as arguments
export interface IDictEventHandler {
  [index: string]: TEventHandler;
}

export interface IDictVoid {
  [index:string]: (() => void);
}

export interface ICalcDataPanelProps extends IPanelProps {
  updateProject(project: IProject): void;
  renderFileUploader: (() => ReactNode);
  title: string;
  project: IProject;
}

export interface ICalcDataPanelState extends IPanelState {
  project: IProject;
  cards: Record<string, ICalcDataPanelCard>;
  costCurveEditorIsOpen: boolean;
  activeEnergySystemId: string;
}

export interface ICalcDataPanelCard {
  name: string;
  title: string;
  isOpen: boolean;
  component: ComponentType<any>;
  eventHandlers: IDictEventHandler;
  info?: string;
  functions?: IDictVoid;
}

export interface ICalcDataCardProps {
  data: any;
}

export interface ICalcDataCardState {

}

export interface ICalcDataAdvancedOptionsCard {
  name: string;
  title: string;
  isOpen: boolean;
  eventHandlers: IDictEventHandler;
  parameters: Record<string, IInputField | IDropdownOptions>;
}

export interface IAdvancedOptionsCardProps {
  isOpen: boolean;
  data: any;
  eventHandlers: IDictEventHandler;
  category: string;
  parameters: Record<string,IInputField | IDropdown>;
}

export interface IDistrictCardProps extends ICalcDataCardProps {
  handleFileUpload(fileName: string, task: any): (() => void);
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  handleChangePath(path: string, value: any): void;
  renderFileUploader: (() => ReactNode);
  data: District;
}

export interface IDistrictCardState extends ICalcDataCardState {
  paramCategories: Record<string, IDistrictParamCategory>;
  mapBoxState: IMapBoxState;
}

export interface IDistrictParamCategory {
  label: string,
  parameters: Record<string, IDistrictInfo>,
}

export interface IDistrictInfo extends IInputField {

}

export interface IMapBoxState {
  zoom: number;
  center: any[];
  markCenter: boolean;
  disableScroll: boolean;

}

export interface ICoord {
  lon: number;
  lat: number;
  [key: string]: ICoord[keyof ICoord];
}

// this is the object returned from the MapBox onClick event  
export interface IMapClickEvent {
  lngLat: [ number, number ];
  zoom: number;
  features: any[];
}

export interface IBuildingTypeCardProps extends ICalcDataCardProps {
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  handleDropdownChange(item: IDropdownAlt): void;
  addBuildingType(): void;
  copyBuildingType(id: string): void;
  deleteBuildingType(id: string): void;
  data: IDictBuildingType;
}


export interface IBuildingTypeCardState extends ICalcDataCardState {
  buildingAdvancedOptions: Record<string, IBuildingAdvancedOptionsCard>;
  deleteBuildingTypeWarningOpen: IDictBool;
}

export interface IBuildingInfoParameter extends IInputField {
  mode: "input"; 
}

export interface IBuildingInfoDropdownOptions extends IDropdownOptions {
  nameKey: "name";
  mode: "dropdownOptions";
}

export interface IBuildingAdvancedOptionsCard extends ICalcDataAdvancedOptionsCard {
  parameters: Record<string, IBuildingInfoParameter | IBuildingInfoDropdownOptions>;
}

export interface IEnergySystemParameter extends IInputField {
  mode: "input";
}

export interface IEnergySystemDropdownOptionPath extends IDropdownOptionPath {
  nameKey: "name";
  mode: "dropdownOptionPath";
}

export interface IEnergySystemDropdownOptions extends IDropdownOptions {
  nameKey: "name";
  mode: "dropdownOptions";
}

export type IEnergySystemDropdown = IEnergySystemDropdownOptionPath | IEnergySystemDropdownOptions;

export interface IEnergySystemsCardProps extends ICalcDataCardProps {
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  handleDropdownChange(item: IDropdownAlt): void;
  addEnergySystem(): void;
  addEnergyCarrier(): void;
  editCostCurve(id: string): void;
  copyEnergySystem(id: string): void;
  deleteEnergySystem(id: string): void;
  copyEnergyCarrier(id: string): void;
  deleteEnergyCarrier(id: string): void;
  data: Record<string,IDictEnergySystem | IDictEnergyCarrier>;
  project: IProject;
}

export interface IEnergySystemsCardState extends ICalcDataCardState {
  energyCarriersOpen: boolean;
  deleteWarningOpen: IDictBool;
}

export interface ICostCurveEditorProps {
  activeEnergySystemId: string;
  energySystems: IDictEnergySystem;
  handleCostCurveEdit(costCurve: ICostCurve, costCurveId: string, energySystemId: string, costCurveScale: TCostCurveScale, costCurveType: TCostCurveCategory): void
}

export interface ICostCurveEditorState {
  activeEnergySystemId: string;
  costCurveScale: ICostCurveScale;
  costCurveCategory: ICostCurveCategory;
  costCurveRows: number;
}

export interface IBuildingMeasuresCardProps extends ICalcDataCardProps {
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  addBuildingMeasure(category: TBuildingMeasureCategory): void;
  copyBuildingMeasure(id: string, category: TBuildingMeasureCategory): void;
  deleteBuildingMeasure(id: string, category: TBuildingMeasureCategory): void;
  data: Record<string, IDictBuildingMeasure>;
}

export interface IBuildingMeasuresCardState extends ICalcDataCardState {
  buildingMeasureCategories: Record<TBuildingMeasureCategory, IBuildingMeasureCategoryCard>;
  deleteWarningOpen: IDictBool;
}

export interface IBuildingMeasureCategoryCard {
  name: string;
  title: string;
  isOpen: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddBuildingMeasureClick: (category: TBuildingMeasureCategory) => void;
  copyBuildingMeasure(id: string, category: TBuildingMeasureCategory): void;
  deleteBuildingMeasure(id: string, category: TBuildingMeasureCategory): void;
  parameters: IBuildingMeasureParameters;
}

export interface IBuildingMeasureInfo extends IInputField {
  type: StringConstructor | NumberConstructor;
  label: string;
  unit: keyof typeof Units;
  disabled?: boolean;
}

export interface IBuildingMeasureParameters {
  measureName: IBuildingMeasureInfo;
  refurbishmentCost: IBuildingMeasureInfo;
  [propName: string]: any;
}

abstract class BaseBuildingMeasureParameters {
  measureName: IBuildingMeasureInfo = {
    key: "measureName",
    type: String,
    label: "Measure name",
    unit: "none",
  };
  lifeTime: IBuildingMeasureInfo = {
    key: "lifeTime",
    type: Number,
    label: "Life time",
    unit: "years",
  };
}

export class EnvelopeMeasureParameters extends BaseBuildingMeasureParameters {
  refurbishmentCost: IBuildingMeasureInfo = {
    key: "refurbishmentCost",
    type: String,
    info: "Cost of adding 1 cm of insulation per square meter",
    label: "Refurbishment cost",
    unit: "euroPerCentimeterMeterSq",
  };
  lambdaValue: IBuildingMeasureInfo = {
    key: "lambdaValue",
    info: "Thermal conductivity of insulation material",
    type: Number,
    label: "λ-value",
    unit: "wattPerMeterKelvin",
  };
  embodiedEnergy: IBuildingMeasureInfo = {
    key: "embodiedEnergy",
    type: Number,
    label: "Embodied energy",
    unit: "kiloWattHourPerCentimeterMeterSq",
  };
  [key: string]: EnvelopeMeasureParameters[keyof EnvelopeMeasureParameters];
}

export class WindowMeasureParameters extends BaseBuildingMeasureParameters {
  refurbishmentCost: IBuildingMeasureInfo = {
    key: "refurbishmentCost",
    info: "Cost per square metre of refurbished window",
    type: String,
    label: "Refurbishment cost",
    unit: "euroPerMeterSq",
  };
  uValue: IBuildingMeasureInfo = {
    key: "uValue",
    info: "Heat transfer coefficient of window including frame",
    type: Number,
    label: "U-value",
    unit: "wattPerMeterSqKelvin",
  };
  gValue: IBuildingMeasureInfo = {
    key: "gValue",
    info: "Total solar energy transmittance",
    type: Number,
    label: "g-value",
    unit: "nonDimensional",
  };
  embodiedEnergy: IBuildingMeasureInfo = {
    key: "embodiedEnergy",
    type: Number,
    label: "Embodied energy",
    unit: "kiloWattHourPerMeterSq",
  };
  [key: string]: WindowMeasureParameters[keyof WindowMeasureParameters];
}

// todo: a lot of data validation is needed here
export class HvacMeasureParameters extends BaseBuildingMeasureParameters {
  refurbishmentCost: IBuildingMeasureInfo = {
    key: "refurbishmentCost",
    info: "Cost of new HVAC system, per building",
    type: String,
    label: "Refurbishment cost",
    unit: "euro",
  };
  embodiedEnergy: IBuildingMeasureInfo = {
    key: "embodiedEnergy",
    type: Number,
    label: "Embodied energy",
    unit: "kiloWattHour",
  };
  ventilationType: IBuildingMeasureInfo = {
    key: "ventilationType",
    info: "E.g. exhaust, supply, balanced, natural, etc.",
    type: String,
    label: "Ventilation system type",
    unit: "none",
  };
  coolingType: IBuildingMeasureInfo = {
    key: "coolingType",
    type: String,
    label: "Cooling system type",
    disabled: true,
    unit: "none",
  };
  heatingType: IBuildingMeasureInfo = {
    key: "heatingType",
    type: String,
    label: "Heating system type",
    disabled: true,
    unit: "none",
  };
  energyCarrier: IBuildingMeasureInfo = {
    key: "energyCarrier",
    type: String,
    label: "Energy carrier",
    disabled: true,
    unit: "none",
  };
  efficiency: IBuildingMeasureInfo = {
    key: "efficiency",
    type: Number,
    label: "Efficiency of heating system",
    unit: "nonDimensional",
  };
  recoveryEfficiency: IBuildingMeasureInfo = {
    key: "recoveryEfficiency",
    type: Number,
    label: "Efficiency of heat recovery",
    unit: "nonDimensional",
  };
  coldWaterTemp: IBuildingMeasureInfo = {
    key: "coldWaterTemp",
    type: Number,
    label: "Cold water temperature",
    unit: "degC",
  };
  hotWaterTemp: IBuildingMeasureInfo = {
    key: "hotWaterTemp",
    type: Number,
    label: "Hot water temperature",
    unit: "degC",
  };
  ventilationRate: IBuildingMeasureInfo = {
    key: "ventilationRate",
    type: Number,
    label: "Ventilation rate",
    unit: "airChangesHourly",
  };

  [key: string]: HvacMeasureParameters[keyof HvacMeasureParameters];
}

export interface IScenariosPanelProps extends IPanelProps {
  updateProject(project: IProject): void;
  title: string;
  project: IProject;
}

export interface IScenariosPanelState extends IPanelState {
  project: IProject;
  scenarioOptions: IScenarioOptionsCard;
  deleteWarningOpen: IDictBool;
}

export type TScenarioParamCategory = "buildingType" | "economy" | "energySystem" | "buildingMeasures";

export interface IScenarioOptionsCard {
  isOpen: Record<string, boolean>;
  eventHandlers: IDictEventHandler;
  paramCategories: Record<TScenarioParamCategory, IScenarioParamCategory>;
}

export interface IScenarioParamCategory {
  label: string,
  info?: string,
  global: boolean,
  parameters: Record<string, IScenarioInput | IScenarioDropdown>,
}

export interface IScenarioInput extends IInputField {
  type: StringConstructor | NumberConstructor;
  mode: "input";
  label: string;
  subPath?: string;
  validator?: (val: string) => IValidatorResult;
}

export interface IScenarioDropdown extends IDropdown {
  optionPath: string; 
  subPath?: string;
  nameKey: "name" | "measureName";
  mode: "dropdownOptionPath";
}

export interface IModelPanelProps extends IPanelProps {
  updateProject(project: IProject): void;
  title: string;
  project: IProject;
}

export interface IModelPanelState extends IPanelState {
  project: IProject;
  modelOptions: Record<TModelOptionsCategory, IModelOptionsCard>;
  calculationActive: boolean;
}

export type TModelOptionsCategory = "energyDemand" | "energySystemOutput" | "energySystemCost";

export interface IModelOptionsCard {
  isOpen: boolean;
  eventHandlers: IDictEventHandler;
  parameters: Record<string, IModelOption>;
  title: string;
}

export interface IModelOption {
  type: StringConstructor | NumberConstructor;
  label: string;
}

export interface IResultsPanelProps extends IPanelProps {
  project: IProject;
  updateProject(project: IProject): void;
 }

export interface IResultsPanelState extends IPanelState { }