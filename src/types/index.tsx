export interface IDictAppData {
    [index: string]: IAppData;
}

export interface IAppData {
    id: string;
    value: string;
}

export interface IAppState {
    dataSets: IDictAppData;
}

export interface IAppProps {
}

export interface IWorkspaceState {
    data: IAppData;
}

export interface IWorkspaceProps {
    updateData(data: IAppData): void;
    data: IAppData;
}

export interface IWorkspaceData extends IAppData {}

export interface IFooterProps {}

export interface IFooterState {
    year: number;
}