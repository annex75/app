import { IProject, District, IDictBuildingType, IDictEnergySystem, TCostCurveScale, ICostCurveCategory, ICostCurveScale, ICostCurve, ISystemSizeCurve, IDictBuildingMeasure, IDictEnergyCarrier, TBuildingMeasureCategory, IValidatorResult, IDictBool, Units } from "./Data";
import { ChangeEvent, ComponentType, ReactNode } from "react";
import { IDropdownAlt } from "../helpers";
import { TCostCurveCategory } from "./classes/EnergySystem";

/* Panels */

export interface IPanelProps {
  title: string;
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
  eventHandlers: IDictEventHandler;
  parameters: Record<string, IOverviewInfo>;
}

export type TInputType = StringConstructor | NumberConstructor | "file";

export interface IInput {
  key: string;
  disabled?: boolean;
  type: TInputType;
  label: string;
  unit?: keyof typeof Units;
  buttonLabel?: string;
  path?: string;
  localPath?: string;
  rootPath?: string;
  handleChange?(e: ChangeEvent<HTMLInputElement>): void;
}

export interface IDropdown {
  key: string;
  disabled?: boolean;
  label: string;
  path?: string; // where to store selected value
  handleChange?(e: ChangeEvent<HTMLInputElement>): void;
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


export interface IOverviewInfo extends IInput {

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
  systemSizeCurveEditorIsOpen: boolean;
  activeEnergySystemId: string;
}

export interface ICalcDataPanelCard {
  name: string;
  title: string;
  isOpen: boolean;
  component: ComponentType<any>;
  eventHandlers: IDictEventHandler;
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
  parameters: Record<string, IInput>;
}

export interface IAdvancedOptionsCardProps {
  isOpen: boolean;
  data: any;
  eventHandlers: IDictEventHandler;
  category: string;
  parameters: Record<string,IInput>;
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

export interface IDistrictInfo extends IInput {

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
  addBuildingType(): void;
  copyBuildingType(id: string): void;
  deleteBuildingType(id: string): void;
  data: IDictBuildingType;
}


export interface IBuildingTypeCardState extends ICalcDataCardState {
  buildingAdvancedOptions: Record<string, IBuildingAdvancedOptionsCard>;
  deleteBuildingTypeWarningOpen: IDictBool;
}

export interface IBuildingInfo extends IInput {

}

export interface IBuildingAdvancedOptionsCard extends ICalcDataAdvancedOptionsCard {
  parameters: Record<string, IBuildingInfo>;
}

export interface IEnergySystemParameter extends IInput {
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
  editSystemSizeCurve(id: string): void;
  data: Record<string,IDictEnergySystem | IDictEnergyCarrier>;
  project: IProject;
}

export interface IEnergySystemsCardState extends ICalcDataCardState {
  energySystemsAdvancedOptions: Record<string,ICalcDataAdvancedOptionsCard>; 
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

export interface ISystemSizeCurveEditorProps {
  activeEnergySystemId: string;
  energySystems: IDictEnergySystem;
  handleSystemSizeCurveEdit(systemSizeCurve: ISystemSizeCurve, curveId: string, costCurveScale: TCostCurveScale, activeEnergySystemId: string): void
}

export interface ISystemSizeCurveEditorState {
  activeEnergySystemId: string;
  systemSizeCurveRows: number;
  costCurveScale: ICostCurveScale;
}


export interface IBuildingMeasuresCardProps extends ICalcDataCardProps {
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  addBuildingMeasure(category: string): void;
  data: Record<string, IDictBuildingMeasure>;
}

export interface IBuildingMeasuresCardState extends ICalcDataCardState {
  buildingMeasureCategories: Record<string, IBuildingMeasureCategoryCard>;
}

export interface IBuildingMeasureCategoryCard {
  name: string;
  title: string;
  isOpen: boolean;
  eventHandlers: IDictEventHandler;
  parameters: IBuildingMeasureParameters;
}

export interface IBuildingMeasureInfo extends IInput {
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
  refurbishmentCost: IBuildingMeasureInfo = {
    key: "refurbishmentCost",
    type: String,
    label: "Refurbishment cost",
    unit: "euro",
  };
  lifeTime: IBuildingMeasureInfo = {
    key: "lifeTime",
    type: Number,
    label: "Life time",
    unit: "years",
  };
  embodiedEnergy: IBuildingMeasureInfo = {
    key: "embodiedEnergy",
    type: Number,
    label: "Embodied energy",
    unit: "kiloWattHour",
  }
}

export class EnvelopeMeasureParameters extends BaseBuildingMeasureParameters {
  uValue: IBuildingMeasureInfo = {
    key: "uValue",
    type: Number,
    label: "U-value",
    unit: "wattPerMeterSqKelvin",
  };
  [key: string]: EnvelopeMeasureParameters[keyof EnvelopeMeasureParameters];
}

export class BasementMeasureParameters extends BaseBuildingMeasureParameters {
  foundationUValue: IBuildingMeasureInfo = {
    key: "foundationUValue",
    type: Number,
    label: "Foundation U-value",
    unit: "wattPerMeterSqKelvin",
  };
  basementWallUValue: IBuildingMeasureInfo = {
    key: "basementUValue",
    type: Number,
    label: "Basement wall U-value",
    unit: "wattPerMeterSqKelvin",
  };
  [key: string]: BasementMeasureParameters[keyof BasementMeasureParameters];
}

export class WindowMeasureParameters extends BaseBuildingMeasureParameters {
  uValue: IBuildingMeasureInfo = {
    key: "uValue",
    type: Number,
    label: "U-value",
    unit: "wattPerMeterSqKelvin",
  };
  gValue: IBuildingMeasureInfo = {
    key: "gValue",
    type: Number,
    label: "g-value",
    unit: "nonDimensional",
  };
  [key: string]: WindowMeasureParameters[keyof WindowMeasureParameters];
}

// todo: a lot of data validation is needed here
export class HvacMeasureParameters extends BaseBuildingMeasureParameters {
  ventilationType: IInput = {
    key: "ventilationType",
    type: String,
    label: "Ventilation system type",
    unit: "none",
  };
  coolingType: IInput = {
    key: "coolingType",
    type: String,
    label: "Cooling system type",
    disabled: true,
    unit: "none",
  };
  heatingType: IInput = {
    key: "heatingType",
    type: String,
    label: "Heating system type",
    disabled: true,
    unit: "none",
  };
  energyCarrier: IInput = {
    key: "energyCarrier",
    type: String,
    label: "Energy carrier",
    disabled: true,
    unit: "none",
  };
  efficiency: IInput = {
    key: "efficiency",
    type: Number,
    label: "Efficiency of heating system",
    unit: "percent",
  };
  recoveryEfficiency: IInput = {
    key: "recoveryEfficiency",
    type: Number,
    label: "Efficiency of heat recovery",
    unit: "percent",
  };
  coldWaterTemp: IInput = {
    key: "coldWaterTemp",
    type: Number,
    label: "Cold water temperature",
    unit: "degC",
  };
  hotWaterTemp: IInput = {
    key: "hotWaterTemp",
    type: Number,
    label: "Hot water temperature",
    unit: "degC",
  };
  ventilationRate: IInput = {
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
}

export type TScenarioParamCategory = "buildingType" | "economy" | "energySystem" | "buildingMeasures";

export interface IScenarioOptionsCard {
  isOpen: Record<string, boolean>;
  eventHandlers: IDictEventHandler;
  paramCategories: Record<TScenarioParamCategory, IScenarioParamCategory>;
}

export interface IScenarioParamCategory {
  label: string,
  global: boolean,
  parameters: Record<string, IScenarioInput | IScenarioDropdown>,
}

export interface IScenarioInput extends IInput {
  type: StringConstructor | NumberConstructor;
  mode: "input";
  label: string;
  validator?: (val: string) => IValidatorResult;
}

export interface IScenarioDropdown extends IDropdown {
  optionPath: string; 
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