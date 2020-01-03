import { Firebase } from "../base";
import { ComponentClass } from "react";

export interface IDictAppData {
    [index: string]: IAppData;
}

export interface IAppData {
    id: string;
    value: string;
}

export interface IAppState {
    authenticated: boolean;
    loading: boolean;
    dataSets: IDictAppData;
    currentUser: any;
}

export interface IAppProps {}

export interface IDataSetListProps {
    dataSets: IDictAppData;
}

export interface IDataSetListState {
    dataSets: IDictAppData;
}

export interface IWorkspaceState {
    data: IAppData;
}

export interface IWorkspaceProps {
    updateData(data: IAppData): void;
    data: IAppData;
}

export interface IWorkspaceData extends IAppData {}

export interface IHeaderProps {
    addData(value: string): void;
    authenticated: boolean;
}

export interface IHeaderState {
    popoverOpen: boolean;
}

export interface INewDataFormState {}

export interface INewDataFormProps {
    addData(value: string): void;
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