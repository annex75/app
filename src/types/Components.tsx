import { IDictProject, IProject } from "./Data";
import { Firebase } from "../base";
import { ReactText } from "react";

/* App */
export interface IAppState {
  authenticated: boolean;
  loading: boolean;
  projects: IDictProject;
  currentUser: firebase.UserInfo | null;
}

export interface IAppProps { }


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

export interface IUserInfoState { }

export interface INewProjectFormState { }

export interface INewProjectFormProps {
  addProject(value: string): void;
  postSubmitHandler: any;
}


/* Footer */
export interface IFooterProps { }

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

export interface ILoginState extends ILogInOutState { }

export interface ILoginProps extends ILogInOutProps {
  authenticated: boolean;
  setCurrentUser(user: any): void;
  location: any;
}

export interface ILogoutState extends ILogInOutState { }

export interface ILogoutProps extends ILogInOutProps { }


/* Workspace */
export interface IWorkspaceState {
  project: IProject;
  tabId: ReactText;
  uploadProgress: number;
}

export interface IWorkspaceProps {
  updateProject(project: IProject): void;
  item: IProject;
  currentUser: firebase.UserInfo;
}

export interface IWorkspaceData extends IProject { }


/* Panels */
export * from './Panels';