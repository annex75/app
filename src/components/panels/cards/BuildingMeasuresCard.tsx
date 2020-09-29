import React, { Component } from 'react';
import { IBuildingMeasuresCardProps, IBuildingMeasuresCardState, IBuildingMeasureCategoryCard, IDictBuildingMeasure, IBuildingMeasureInfo, EnvelopeMeasureParameters, WindowMeasureParameters, HvacMeasureParameters, TBuildingMeasureCategory, IDictBool } from '../../../types';
import { Button, Collapse, FormGroup, Position, Tooltip, Alert, Intent } from '@blueprintjs/core';

import { renderInputField, renderInputLabel, } from '../../../helpers';

export class BuildingMeasuresCard extends Component<IBuildingMeasuresCardProps, IBuildingMeasuresCardState> {
  
  constructor(props: IBuildingMeasuresCardProps) {
    super(props);   
    const buildingMeasureCategories: Record<TBuildingMeasureCategory,IBuildingMeasureCategoryCard> = {
      // todo: it would be neat if a factory could produce these
      insulation: {
        name: "insulation",
        title: "Additional insulation",
        isOpen: false,
        handleChange: this.props.handleChange,
        handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        copyBuildingMeasure: this.props.copyBuildingMeasure,
        deleteBuildingMeasure: this.props.deleteBuildingMeasure,
        parameters: new EnvelopeMeasureParameters(),
      },
      windows: {
        name: "windows",
        title: "Windows",
        isOpen: false,
        handleChange: this.props.handleChange,
        handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        copyBuildingMeasure: this.props.copyBuildingMeasure,
        deleteBuildingMeasure: this.props.deleteBuildingMeasure,
        parameters: new WindowMeasureParameters(),
      },
      hvac: {
        name: "hvac",
        title: "HVAC system",
        isOpen: false,
        handleChange: this.props.handleChange,
        handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        copyBuildingMeasure: this.props.copyBuildingMeasure,
        deleteBuildingMeasure: this.props.deleteBuildingMeasure,
        parameters: new HvacMeasureParameters(),
      },
    };

    let deleteWarningOpen: IDictBool = {};
    Object.keys(props.data).forEach((cat: string) => Object.keys(props.data[cat]).forEach((id: string) => {
      deleteWarningOpen[id] = false;
    }));

    this.state = { 
      buildingMeasureCategories,
      deleteWarningOpen,
    };
  }

  handleExpandBuildingMeasuresCategoryClick = (name: TBuildingMeasureCategory) => {
    let newState = { ...this.state };
    newState.buildingMeasureCategories[name].isOpen = !newState.buildingMeasureCategories[name].isOpen;
    this.setState(newState);
  }

  handleAlertOpen = (id: string) => {
    let newState = { ...this.state };
    newState.deleteWarningOpen[id] = true;
    this.setState(newState);
  }

  // todo: cancel and confirm could share function
  handleAlertCancel = (id: string) => {
    let newState = { ...this.state };
    newState.deleteWarningOpen[id] = false;
    this.setState(newState);
  }

  handleAlertConfirm = (id: string, category: TBuildingMeasureCategory) => {
    let newState = { ...this.state };
    newState.deleteWarningOpen[id] = false;
    this.setState(newState);
    this.props.deleteBuildingMeasure(id, category);
  }

  render() {
    const buildingMeasures = this.props.data;
    return (
      <div>
        {
          Object.keys(this.state.buildingMeasureCategories).map(id => {
            const card = this.state.buildingMeasureCategories[id as TBuildingMeasureCategory];
            const data = buildingMeasures[id];
            return (
              <div className="advanced-options-wrapper" key={`${id}-div`}>
                <Button
                  minimal
                  className="bp3-button"
                  name={card.name}
                  icon={card.isOpen ? "arrow-up" : "arrow-down"}
                  onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandBuildingMeasuresCategoryClick(id as TBuildingMeasureCategory)}>
                  <h4>{card.title}</h4>
                </Button>
                <BuildingMeasureCategoryCard
                  key={id} 
                  isOpen={card.isOpen}
                  data={data}
                  category={id as TBuildingMeasureCategory}
                  parameters={card.parameters}
                  handleChange={card.handleChange}
                  handleAddBuildingMeasureClick={card.handleAddBuildingMeasureClick}
                  handleAlertConfirm={this.handleAlertConfirm}
                  handleAlertOpen={this.handleAlertOpen}
                  handleAlertCancel={this.handleAlertCancel}
                  copyBuildingMeasure={card.copyBuildingMeasure}
                  deleteBuildingMeasure={card.deleteBuildingMeasure}
                  deleteWarningOpen={this.state.deleteWarningOpen}/>
              </div>
            )
          })
        }
      </div>
    )
  }
}

// todo: this interface turned into an absolute mess now
interface IBuildingMeasureCategoryCardProps {
  isOpen: boolean;
  data: IDictBuildingMeasure;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddBuildingMeasureClick: (category: TBuildingMeasureCategory) => void;
  handleAlertConfirm: (id: string, category: TBuildingMeasureCategory) => void;
  handleAlertCancel: (id: string) => void;
  handleAlertOpen: (id: string) => void;
  copyBuildingMeasure(id: string, category: TBuildingMeasureCategory): void;
  deleteBuildingMeasure(id: string, category: TBuildingMeasureCategory): void;
  deleteWarningOpen: IDictBool,
  category: TBuildingMeasureCategory;
  parameters: Record<string,IBuildingMeasureInfo>;
}

const BuildingMeasureCategoryCard = (props: IBuildingMeasureCategoryCardProps) => {
  const buildingMeasures = props.data;
  const category = props.category;
  return (
    <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
      <div className="scrollable-panel-content">
        <div className="panel-list-header">
          {
            <FormGroup
              inline
              className="inline-input"
              key={`energy-systems-buttons-header`}
              label=" "
              labelFor={`energy-systems-buttons-header`}>
            {
              Object.keys(buildingMeasures).filter(id => !buildingMeasures[id].deleted).map(id => {
                return (
                  <div key={`energy-systems-button-header-${id}`} className="building-type-button-header-div">
                    <Tooltip content={`Copy Building Measure "${buildingMeasures[id].measureName}"`} position={Position.TOP}>
                      <Button onClick={() => props.copyBuildingMeasure(id, category)} className="bp3-minimal building-type-header-button bp3-icon-duplicate"></Button>
                    </Tooltip>
                    <Alert
                      cancelButtonText="Cancel"
                      confirmButtonText="Delete Building Measure"
                      intent={Intent.DANGER}
                      isOpen={props.deleteWarningOpen[id]}
                      onCancel={() => props.handleAlertCancel(id)}
                      onConfirm={() => props.handleAlertConfirm(id, category)}>
                      <p>
                        Are you sure you want to delete this Building Measure? This action is irreversible!
                      </p>
                    </Alert>
                    <Tooltip intent={Intent.WARNING} content={`Delete Building Measure "${buildingMeasures[id].measureName}"`} position={Position.TOP}>
                      <Button className="bp3-minimal building-type-header-button bp3-icon-delete" onClick={() => props.handleAlertOpen(id)}></Button>
                    </Tooltip>
                  </div>
                )
              })
            }
            <span className="empty-button"/>
          </FormGroup>
          }
        </div>
      {
        Object.keys(props.parameters).map( (paramName: string, i: number) => {
          const param = props.parameters[paramName];
          return (
            <div key={`building-measure-${paramName}-div`}>
              <FormGroup
                inline
                className="inline-input"
                key={`building-measure-${paramName}-input`}
                label={renderInputLabel(param)}
                labelFor={`building-measure-${paramName}-input`}>
                {
                  Object.keys(buildingMeasures).filter(id => !buildingMeasures[id].deleted).map(id => {
                    param.path = `buildingMeasures.${category}.${id}.${paramName}`;
                    param.localPath = `${id}.${paramName}`;
                    return renderInputField(`building-measure-${id}`, param, buildingMeasures, props.handleChange)
                  })
                }
                {
                  !i?  // only have an add button on the first row (i == 0)
                  <Button
                    minimal
                    className="bp3-button add-button"
                    icon="add"
                    onClick={(e: React.MouseEvent<HTMLElement>) => { 
                      props.handleAddBuildingMeasureClick(category);
                    }} />
                  : <span className="empty-button"/>
                }
              </FormGroup>
            </div>
          )
          
        })
      }
      </div>
    </Collapse>
  )
}
