// external
import React, { Component, ReactText, FormEvent } from 'react';
import classNames from 'classnames'
// @ts-ignore
import { Breadcrumb, Classes, ProgressBar, Tab, Tabs, Intent, FileInput, IToastProps } from '@blueprintjs/core';
import firebase from 'firebase/app';
import { set as _fpSet } from 'lodash/fp';

// internal
import { IWorkspaceState, IWorkspaceProps } from '../types/index';
import { OverviewPanel, CalcDataPanel, ScenariosPanel, ModelPanel, ResultsPanel } from './Panels';
import { MAX_EPW_FILE_SIZE } from '../constants'
import { AppToaster } from '../toaster';


export class Workspace extends Component<IWorkspaceProps, IWorkspaceState> {
  progressToaster: string = "";
  
  constructor(props: IWorkspaceProps) {
    super(props);
    this.state = {
      project: props.item,
      tabId: "overview",
      uploadProgress: 0,
    }
  }

  componentDidUpdate(prevProps: IWorkspaceProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({ project: this.props.item });
    }
  }

  handleTabChange = (tabId: ReactText, oldTab: ReactText, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.setState({ tabId });
  }

  formatValue = () => {
    return { __html: `The value in the text box is "${this.props.item.name}"` };
  }

  // todo: this is currently hardcoded to only accept .epw files for the district card. do we need more fileuploaders?
  renderFileUploader = () => {
    return (  
      <div>
        <FileInput
          text={this.state.project.calcData.district.climate.filename || "Choose file..." }
          onInputChange={(e) => { this.handleFileInput(e) }} 
          inputProps={{ accept: ".epw" }}/>
      </div>  
    )
  }

  handleFileInput = (e: FormEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    if (input && input.files && input.files.length) {
      this.startUpload(input.files[0]);
    }
  }

  startUpload = (f: File) => {
    this.handleUploadStart();
    const storageRef = firebase.storage().ref(`epw/${this.props.currentUser!.uid}`);
    const fileRef = storageRef.child(f.name)
    const uploadTask = fileRef.put(f);
    uploadTask.on('state_changed', (snapshot: firebase.storage.UploadTaskSnapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        this.handleProgress(progress);
      }, (err: Error) => {
        this.handleUploadError(err);
      }, () => {  
        this.handleUploadSuccess(uploadTask.snapshot);
      }
    );
  }

  handleUploadStart = () => {
    this.progressToaster = AppToaster.show(this.renderProgress(0));  
  }

  renderProgress = (p: number, success: boolean = true) => {
    const toast: IToastProps = { 
      icon: "cloud-upload",
      message: (
        <div>
          <ProgressBar
            className={classNames({ [Classes.PROGRESS_NO_STRIPES]: p >= 100 })}
            intent={ p < 100 ? Intent.PRIMARY : (success? Intent.SUCCESS : Intent.DANGER)}
            value={ p / 100 }
          />
        </div>
      ),
      timeout: p < 100 ? 0 : 2000,
    }
    return toast;
  }

  handleUploadError = (e: Error) => {
    this.handleUploadEnded(false);
    AppToaster.show({ intent: Intent.DANGER, message: `File could not be uploaded. Maximum file size is ${MAX_EPW_FILE_SIZE}.` });
  }

  handleUploadSuccess = (snapshot: firebase.storage.UploadTaskSnapshot) => {
    this.handleUploadEnded(true);
    const fileName = snapshot.metadata.name;
    
    // todo: it's annoying that this happens here as we have this functionality in CalcDataPanel
    // but we don't want the CalcDataPanel to know about the user, either.
    const path = "project.calcData.district.climate.filename";
    const newState = _fpSet(path, fileName, this.state);
    this.setState(newState);
    this.props.updateProject(newState.project);
    
  }

  handleUploadEnded = (success: boolean) => {
    AppToaster.show(this.renderProgress(100, success), this.progressToaster);
    this.setState({ uploadProgress: 0 }); 
  }

  handleProgress = (p: number) => {
    this.setState({ uploadProgress: p })
    AppToaster.show(this.renderProgress(p), this.progressToaster);
  }

  render() {
    const { item: project } = this.props;
    return (
      <div>
        <ul className="bp3-breadcrumbs">
          <li><Breadcrumb href="/projects" text="Projects" /></li>
          <li><Breadcrumb href="#" text={project.name} /></li>
        </ul>

        <Tabs id="WorkspaceTabs" onChange={this.handleTabChange} selectedTabId={this.state.tabId}>
          <Tab id="overview" title={"Overview"} panel={
            <OverviewPanel
              updateProject={this.props.updateProject}
              title="Overview"
              project={this.state.project}/>
          } />
          <Tab id="calc-data" title={"Calculation data"} panel={
            <CalcDataPanel
              title="Calculation data"
              updateProject={this.props.updateProject}
              renderFileUploader={this.renderFileUploader}
              project={this.state.project}/>
          } />
          <Tab id="scenarios" title={"Scenarios"} panel={
            <ScenariosPanel 
              title="Scenarios" 
              updateProject={this.props.updateProject}
              project={this.state.project}/>
          } />
          <Tab disabled id="model" title={"Model settings"} panel={
            <ModelPanel
              title="Calculation model settings"
              updateProject={this.props.updateProject}
              project={this.state.project}/>
          } />
          <Tab disabled id="results" title={"Results"} panel={<ResultsPanel title="Results" />} />
        </Tabs>
      </div>
    );
  }
}