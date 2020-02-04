import { IProject, District, IDictBuilding } from "./Data";
import { ChangeEvent } from "react";

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
    cards: IDictCalcDataPanelCard;
}

export interface IDictCalcDataPanelCard {
    [index: string]: ICalcDataPanelCard;
}
export interface ICalcDataPanelCard {
    name: string;
    title: string;
    isOpen: boolean;
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
}

export interface IScenariosPanelProps extends IPanelProps {}

export interface IScenariosPanelState extends IPanelState {}

export interface IModelPanelProps extends IPanelProps {}

export interface IModelPanelState extends IPanelState {}

export interface IResultsPanelProps extends IPanelProps {}

export interface IResultsPanelState extends IPanelState {}