import React, { Component, ChangeEvent, ReactText } from 'react';
import { Breadcrumb } from '@blueprintjs/core';
import { Tab, Tabs } from "@blueprintjs/core";
import { IWorkspaceState, IWorkspaceProps } from '../types/index';
import { OverviewPanel, CalcDataPanel, ScenariosPanel, ModelPanel, ResultsPanel } from './Panels';

export class Workspace extends Component<IWorkspaceProps, IWorkspaceState> {
  constructor(props: IWorkspaceProps) {
    super(props);
    this.state = {
      project: props.item,
      tabId: "overview",
    }
  }

  componentDidUpdate(prevProps: IWorkspaceProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({ project: this.props.item });
    }
  }

  handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const project = { ...this.props.item };
    project.name = e.target.value;
    this.props.updateProject(project);
  }

  handleTabChange = (tabId: ReactText, oldTab: ReactText, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.setState({ tabId });
  }

  formatValue = () => {
    return { __html: `The value in the text box is "${this.props.item.name}"` };
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
              project={this.state.project}/>
          } />
          <Tab id="scenarios" title={"Scenarios"} panel={
            <ScenariosPanel 
              title="Scenarios" 
              updateProject={this.props.updateProject}
              project={this.state.project}/>
          } />
          <Tab id="model" title={"Model settings"} panel={<ModelPanel title="Model settings" />} />
          <Tab id="results" title={"Results"} panel={<ResultsPanel title="Results" />} />
        </Tabs>
        {/*
                <h2 style={{margin: "0.5em 0"}}>{project.name}</h2>
                <div className="workspace">
                    <div className="panel">
                        <h3>Input</h3>
                        <textarea
                            style={{width: "100%", height:"100%"}}
                            onChange={this.handleChange}
                            value={project.name} />
                    </div>
                    <div className="panel">
                        <h3>Output</h3>
                        <div
                            style={{width: "100%", height:"100%", fontFamily: "monospace"}}
                            className="workspace-output"
                            dangerouslySetInnerHTML={this.formatValue()}/>
                    </div>
                </div>
                */}
      </div>
    );
  }
}