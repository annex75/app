import { Firebase } from "../base";
import { ReactText, ComponentType } from "react";

export interface IDictProject {
    [index: string]: IProject;
}

export interface IDictBool {
    [index: string]: boolean;
}

export interface IDictComponentType {
    [index: string]: ComponentType<any>;
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

    // location information
    location: Location = new Location();

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

export class Location {
    country: Country = new Country();
    place: string = "";
    lat: number = 0;
    lon: number = 0;
}

export class Country {
    country: string = "";
}

export class ResultOverview {

}

// todo: defined here now, should be moved to @annex-75/calculation-model npm package
export class CalcData {
    district: string = "Placeholder for district data";
    buildings: string = "Placeholder for building data";
    energySystems: string = "Placeholder for energy system data";
    buildingMeasures: string = "Placeholder for building measure data";
}


/* App */
export interface IAppState {
    authenticated: boolean;
    loading: boolean;
    projects: IDictProject;
    currentUser: firebase.UserInfo | null;
}

export interface IAppProps {}


/* Project list */
export interface IProjectListProps {
    updateProject(project: IProject): void;
    copyProject(project: IProject): void;
    deleteProject(id: string): void;
    projects: IDictProject;
}

export interface IProjectListState {
    projectPopoverOpen: IDictPopover;
    projects: IDictProject;
}

export interface IDictPopover {
    [index: string]: boolean;
}

export interface IProjectSettingsProps {
    updateProject(project: IProject): void;
    copyProject(project: IProject): void;
    deleteProject(id: string): void;
    project: IProject;
    postSubmitHandler: any;
}

export interface IProjectSettingsState {
    deleteProjectWarningOpen: boolean;
    project: IProject;
}


/* Header */
export interface IHeaderProps {
    addProject(value: string): void;
    userData: firebase.UserInfo | null;
    authenticated: boolean;
}

export interface IHeaderState {
    userPopoverOpen: boolean;
    projectPopoverOpen: boolean;
}

export interface IUserInfoProps {
    userData: firebase.UserInfo | null;
}

export interface IUserInfoState {}

export interface INewProjectFormState {}

export interface INewProjectFormProps {
    addProject(value: string): void;
    postSubmitHandler: any;
}


/* Footer */
export interface IFooterProps {}

export interface IFooterState {
    year: number;
}


/* Login/Logout */
export interface ILogInOutState {
    redirect: boolean;
}

export interface ILogInOutProps {
    fb: Firebase;
}

export interface ILoginState extends ILogInOutState {}

export interface ILoginProps extends ILogInOutProps {
    authenticated: boolean;
    setCurrentUser(user: any): void;
    location: any;
}

export interface ILogoutState extends ILogInOutState {}

export interface ILogoutProps extends ILogInOutProps {}


/* Workspace */
export interface IWorkspaceState {
    project: IProject;
    tabId: ReactText;
}

export interface IWorkspaceProps {
    updateProject(project: IProject): void;
    item: IProject;
}

export interface IWorkspaceData extends IProject {}


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

export interface IScenariosPanelProps extends IPanelProps {}

export interface IScenariosPanelState extends IPanelState {}

export interface IModelPanelProps extends IPanelProps {}

export interface IModelPanelState extends IPanelState {}

export interface IResultsPanelProps extends IPanelProps {}

export interface IResultsPanelState extends IPanelState {}