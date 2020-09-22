import React, { Component } from 'react';
import { IBuildingMeasuresCardProps, IBuildingMeasuresCardState, IBuildingMeasureCategoryCard, IDictEventHandler, IDictBuildingMeasure, IBuildingMeasureInfo, EnvelopeMeasureParameters, WindowMeasureParameters, HvacMeasureParameters, TBuildingMeasureCategory } from '../../../types';
import { Button, Collapse, FormGroup } from '@blueprintjs/core';

import { renderInputField, renderInputLabel, } from '../../../helpers';

export class BuildingMeasuresCard extends Component<IBuildingMeasuresCardProps, IBuildingMeasuresCardState> {
  
  constructor(props: IBuildingMeasuresCardProps) {
    super(props);   
    const buildingMeasureCategories: Record<string,IBuildingMeasureCategoryCard> = {
      // todo: it would be neat if a factory could produce these
      insulation: {
        name: "insulation",
        title: "Additional insulation",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: new EnvelopeMeasureParameters(),
      },
      windows: {
        name: "windows",
        title: "Windows",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: new WindowMeasureParameters(),
      },
      hvac: {
        name: "hvac",
        title: "HVAC system",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: new HvacMeasureParameters(),
      },
    };

    this.state = { buildingMeasureCategories };
  }

  handleExpandBuildingMeasuresCategoryClick = (name: TBuildingMeasureCategory) => {
    let newState = { ...this.state };
    newState.buildingMeasureCategories[name].isOpen = !newState.buildingMeasureCategories[name].isOpen;
    this.setState(newState);
  }

  render() {
    const buildingMeasures = this.props.data;
    return (
      <div>
        {
          Object.keys(this.state.buildingMeasureCategories).map(id => {
            const card = this.state.buildingMeasureCategories[id];
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
                <BuildingMeasureCategoryCard key={id} isOpen={card.isOpen} data={data} eventHandlers={card.eventHandlers} category={id} parameters={card.parameters} />
              </div>
            )
          })
        }
      </div>
    )
  }
}

interface IBuildingMeasureCategoryCardProps {
  isOpen: boolean;
  data: IDictBuildingMeasure;
  eventHandlers: IDictEventHandler;
  category: string;
  parameters: Record<string,IBuildingMeasureInfo>;
}

const BuildingMeasureCategoryCard = (props: IBuildingMeasureCategoryCardProps) => {
  const buildingMeasures = props.data;
  const category = props.category;
  return (
    <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
      <div className="scrollable-panel-content">
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
                  Object.keys(buildingMeasures).map(id => {
                    param.path = `buildingMeasures.${category}.${id}.${paramName}`;
                    param.localPath = `${id}.${paramName}`;
                    return renderInputField(`building-measure-${id}`, param, buildingMeasures, props.eventHandlers.handleChange as ((e: React.ChangeEvent<HTMLInputElement>) => void))
                  })
                }
                {
                  !i?  // only have an add button on the first row (i == 0)
                  <Button
                    minimal
                    className="bp3-button add-button"
                    icon="add"
                    onClick={(e: React.MouseEvent<HTMLElement>) => { 
                      const eventHandler = props.eventHandlers.handleAddBuildingMeasureClick as ((category: string) => void);
                      eventHandler(category);
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
