import { Firebase } from "../base";
import { ComponentClass } from "react";

export interface IDictProject {
    [index: string]: IProject;
}

export interface IProject {
    id: string;
    value: string;
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
}

export interface IWorkspaceProps {
    updateProject(project: IProject): void;
    item: IProject;
}

export interface IWorkspaceData extends IProject {}

export interface IHeaderProps {
    addProject(value: string): void;
    authenticated: boolean;
}

export interface IHeaderState {
    popoverOpen: boolean;
}

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