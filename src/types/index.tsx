import { Firebase } from "../base";
import { ComponentClass, ReactText } from "react";

export interface IDictProject {
    [index: string]: IProject;
}

export interface IProject {
    id: string;
    name: string;
    owner: string;
}

export interface IAppState {
    authenticated: boolean;
    loading: boolean;
    projects: IDictProject;
    currentUser: firebase.UserInfo | null;
}

export interface IAppProps {}

export interface IProjectListProps {
    projects: IDictProject;
}

export interface IProjectListState {
    projects: IDictProject;
}

export interface IWorkspaceState {
    project: IProject;
    tabId: ReactText;
}

export interface IWorkspaceProps {
    updateProject(project: IProject): void;
    item: IProject;
}

export interface IWorkspaceData extends IProject {}

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
    postSubmitHandler: any
}

export interface IFooterProps {}

export interface IFooterState {
    year: number;
}

export interface ILogInOutState {
    redirect: boolean;
}

export interface ILogInOutProps {
    fb: Firebase;
}

export interface ILoginState extends ILogInOutState {}

export interface ILoginProps extends ILogInOutProps {
    setCurrentUser(user: any): void;
    location: any;
}

export interface ILogoutState extends ILogInOutState {}

export interface ILogoutProps extends ILogInOutProps {}

export interface IPanelProps {
    title: string;
}

export interface IPanelState {}

export interface IOverviewPanelProps extends IPanelProps {}

export interface IOverviewPanelState extends IPanelState {}

export interface ICalcDataPanelProps extends IPanelProps {}

export interface ICalcDataPanelState extends IPanelState {}

export interface IScenariosPanelProps extends IPanelProps {}

export interface IScenariosPanelState extends IPanelState {}

export interface IModelPanelProps extends IPanelProps {}

export interface IModelPanelState extends IPanelState {}

export interface IResultsPanelProps extends IPanelProps {}

export interface IResultsPanelState extends IPanelState {}