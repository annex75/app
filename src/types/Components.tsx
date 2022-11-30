// external
import { ReactText } from "react";
import xlsx from 'xlsx';

// internal
import { IDictProject, IProject } from "./Data";
import { FirebaseInstance } from "../base";

/* App */
export interface IAppState {
  loading: boolean;
  updating: boolean;
  activeProjectId: string;
  projects: IDictProject;
  changelog: string; // md string with changelog
  gettingStarted: string; // md string with getting started info
  currentUser: firebase.UserInfo | null;
  gdprPromptOpen: boolean;
}

export interface IAppProps { }

/* Project list */
export interface IProjectListProps {
  addProject(value: string, workbook: xlsx.WorkBook | null): void;
  setActiveProject(projectId: string): void;
  updateProject(project: IProject): void;
  copyProject(project: IProject): void;
  exportProject(id: string): void;
  deleteProject(id: string): void;
  projects: IDictProject;
}

export interface IProjectListState {
  projectPopoverOpen: IDictPopover;
  addProjectPopoverOpen: boolean;
  projects: IDictProject;
}

export interface IDictPopover {
  [index: string]: boolean;
}

export interface IProjectSettingsProps {
  updateProject(project: IProject): void;
  copyProject(project: IProject): void;
  exportProject(id: string): void;
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
  userData: firebase.UserInfo | null;
  exitProject(): void;
  activeProject: IProject | null;
  authenticated: boolean;
}

export interface IHeaderState {
  userPopoverOpen: boolean;
}

export interface IUserInfoProps {
  userData: firebase.UserInfo | null;
}

export interface IUserInfoState { }

export interface INewProjectFormState {
  workbook: xlsx.WorkBook | null;
  jsonProject: IProject | null;
  xlsxFile: string;
  jsonFile: string;
  uploading: boolean;
}

export interface INewProjectFormProps {
  addProject(value: string, workbook: xlsx.WorkBook | null, jsonProject: IProject | null): void;
  postSubmitHandler: any;
}

/* Footer */
export interface IFooterProps { }

export interface IFooterState {
  year: number;
  helpPopoverOpen: boolean;
  privacyDialogOpen: boolean;
}

/* Landing page */

export interface ILandingPageState {
  open: {
    changelog: boolean,
    gettingStarted: boolean,
  }
}

export interface ILandingPageProps {
  changelog: string;
  gettingStarted: string;
}

/* Login/Logout */
export interface ILogInOutState {
  redirect: boolean;
}

export interface ILogInOutProps {
  fb: FirebaseInstance;
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
  exitProject(): void;
  updateProject(project: IProject): void;
  item: IProject;
  currentUser: firebase.UserInfo;
}

export interface IWorkspaceData extends IProject { }


/* Panels */
export * from './Panels';