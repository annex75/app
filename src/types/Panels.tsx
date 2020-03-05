import { IProject, District, IDictBuilding, IDictEventHandler, IDictEnergySystem, ICostCurveType, ICostCurve, IDictBuildingMeasure } from "./Data";
import { ChangeEvent, ComponentType } from "react";

/* Panels */

export interface IPanelProps {
    title: string;
}

export interface IPanelState {}

export interface IOverviewPanelProps extends IPanelProps {
    updateProject(project: IProject): void;
    title: string;
    project: IProject;
}

export interface IOverviewPanelState extends IPanelState {
    project: IProject;
}

export interface ICalcDataPanelProps extends IPanelProps {
    updateProject(project: IProject): void;
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
}

export interface ICalcDataCardProps {
    data: any;
}

export interface ICalcDataCardState {

}

export interface IDistrictCardProps extends ICalcDataCardProps {
    handleFileInput(e: ChangeEvent<HTMLInputElement>): void;
    handleChange(e: ChangeEvent<HTMLInputElement>): void;
    data: District;
}

export interface IBuildingCardProps extends ICalcDataCardProps {
    handleChange(e: ChangeEvent<HTMLInputElement>): void;
    addBuilding(): void;
    data: IDictBuilding;
}


export interface IBuildingCardState extends ICalcDataCardState {
    advancedIsOpen: boolean;
    buildingAdvancedOptions: Record<string,IBuildingAdvancedOptionsCard>;
}

export interface IBuildingInfo {
  type: StringConstructor | NumberConstructor;
  label: string;
}

export interface IBuildingAdvancedOptionsCard {
  name: string;
  title: string;
  isOpen: boolean;
  eventHandlers: IDictEventHandler;
  parameters: Record<string,IBuildingInfo>;
}

export interface IEnergySystemsCardProps extends ICalcDataCardProps {
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  addEnergySystem(): void;
  editCostCurve(id: string): void;
  data: IDictEnergySystem;
}

export interface ICostCurveEditorProps {
  activeEnergySystemId: string;
  energySystems: IDictEnergySystem;
  handleCostCurveEdit(costCurve: ICostCurve, costCurveId: string, energySystemId: string, costCurveType: string): void
}

export interface ICostCurveEditorState {
  activeEnergySystemId: string;
  costCurveType: ICostCurveType;
  costCurveRows: number;
}

export interface IBuildingMeasuresCardProps extends ICalcDataCardProps {
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  addBuildingMeasure(category: string): void;
  data: Record<string,IDictBuildingMeasure>;
}

export interface IBuildingMeasuresCardState extends ICalcDataCardState {
  buildingMeasureCategories: Record<string,IBuildingMeasureCategoryCard>;
}

export interface IBuildingMeasureCategoryCard {
  name: string;
  title: string;
  isOpen: boolean;
  eventHandlers: IDictEventHandler;
  parameters: Record<string,IBuildingMeasure>;
}

export interface IBuildingMeasure {
  type: StringConstructor | NumberConstructor;
  label: string;
  unit: string;
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

export type TScenarioParamCategory = "building" | "energySystem" | "buildingMeasures";

export interface IScenarioOptionsCard {
  isOpen: Record<string,boolean>;
  eventHandlers: IDictEventHandler;
  parameters: Record<TScenarioParamCategory,Record<string,IScenarioInfo>>;
  labels: Record<string,string>;
}

export interface IScenarioInfo {
  type: StringConstructor | NumberConstructor;
  label: string;
}

export interface IModelPanelProps extends IPanelProps {}

export interface IModelPanelState extends IPanelState {}

export interface IResultsPanelProps extends IPanelProps {}

export interface IResultsPanelState extends IPanelState {}