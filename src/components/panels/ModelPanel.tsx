// external
import React, { Component, ChangeEvent } from 'react';
import { set as _fpSet } from 'lodash/fp';
import { debounce as _debounce } from 'lodash';

// internal
import { IModelPanelProps, IModelPanelState, IModelOptionsCard, TModelOptionsCategory } from '../../types';
import { Switch } from '@blueprintjs/core';
import { InfoButton } from '../../helpers';

export class ModelPanel extends Component<IModelPanelProps, IModelPanelState> {
  constructor(props: IModelPanelProps) {
    super(props);
    const project = props.project;
    const modelOptions: Record<TModelOptionsCategory,IModelOptionsCard> = {
      energyDemand: {
        eventHandlers: { handleChange: this.handleChange },
        isOpen: false,
        parameters: {
          placeholder: {
            type: String,
            label: "placeholder"
          },
        },
        title: "Energy demand"
      },
      energySystemCost: {
        eventHandlers: { handleChange: this.handleChange },
        isOpen: false,
        parameters: {
          placeholder: {
            type: String,
            label: "placeholder"
          },
        },
        title: "Energy system cost"
      },
      energySystemOutput: {
        eventHandlers: { handleChange: this.handleChange },
        isOpen: false,
        parameters: {
          placeholder: {
            type: String,
            label: "placeholder"
          },
        },
        title: "Energy system output"
      }
      
    }

    this.state = {
      project,
      modelOptions,
      calculationActive: false,
    }  
  }

  componentDidUpdate(prevProps: IModelPanelProps) {
    if (this.props.project !== prevProps.project) {
      this.setState({ project: this.props.project });
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const path = this.formatPath(e.target.name);
    const newState = _fpSet(path, e.target.value, this.state);
    this.setState(newState);
    this.updateProjectDebounce();
  }

  updateProject = () => this.props.updateProject(this.state.project);
  updateProjectDebounce = _debounce(this.updateProject, 1000);

  handleActivateCalculation = (e: React.FormEvent<HTMLInputElement>) => {
    const newState = _fpSet("project.calculationActive", !this.state.project.calculationActive, this.state);
    this.setState(newState, () => {
      this.updateProject();
    });
  }

  // takes a subpath and returns its location in the main data structure
  formatPath = (childPath: string) => {
    return `project.${childPath}`;
  }
  
  render() {
    //todo: implement this similarly to the ScenariosPanel
    return (
      <div>
        <InfoButton level={1} label={this.props.title}/>
        <div className="bp3-card panel-card" >
          <h3>Calculations</h3>
          <Switch checked={this.state.project.calculationActive} label="Activate calculations" onChange={this.handleActivateCalculation} />
        </div>
        <div className="bp3-card panel-card" >Energy demand</div>
        <div className="bp3-card panel-card" >Energy system output</div>
        <div className="bp3-card panel-card" >Energy system cost</div>
      </div>
    )
  }
}