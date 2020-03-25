import React, { Component, ChangeEvent } from "react"

import { IBuildingTypeCardProps, IBuildingTypeCardState, IBuildingAdvancedOptionsCard, IAdvancedOptionsCardProps, IDictBuildingType } from "../../../types";
import { renderInputField } from '../../../helpers'

import { FormGroup, Button, InputGroup, Collapse } from "@blueprintjs/core";

export class BuildingTypeCard extends Component<IBuildingTypeCardProps, IBuildingTypeCardState> {

  constructor(props: IBuildingTypeCardProps) {
    super(props);

    const buildingAdvancedOptions: Record<string,IBuildingAdvancedOptionsCard> = {
      "buildingInformation": {
        name: "buildingInformation",
        title: "Building type information",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
        },
        parameters: {
          constructionYear: {
            key: "constructionYear",
            type: Number,
            label: "Construction year:",
            rootPath: "buildingTypes",
          },
          buildingClass: {
            key: "buildingClass",
            type: Number,
            label: "Building class:",
            rootPath: "buildingTypes",
          },
          energyPerformanceCertificate: {
            key: "energyPerformanceCertificate",
            type: String,
            label: "Energy performance certificates:",
            rootPath: "buildingTypes",
          },
          ownership: {
            key: "ownership",
            type: String,
            label: "Ownership:",
            rootPath: "buildingTypes",
          }
        }
      },
      "buildingGeometry": {
        name: "buildingGeometry",
        title: "Geometry",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
        },
        parameters: {
          grossFloorArea: {
            key: "grossFloorArea",
            type: Number,
            label: "Gross heated floor area:",
            rootPath: "buildingTypes",
          },
          heatedVolume: {
            key: "heatedVolume",
            type: Number,
            label: "Heated volume:",
            rootPath: "buildingTypes",
          },
          facadeAreaN: {
            key: "facadeAreaN",
            type: Number,
            label: "Façade area to the North:",
            rootPath: "buildingTypes",
          },
          facadeAreaE: {
            key: "facadeAreaE",
            type: Number,
            label: "Façade area to the East:",
            rootPath: "buildingTypes",
          },
          facadeAreaS: {
            key: "facadeAreaS",
            type: Number,
            label: "Façade area to the South:",
            rootPath: "buildingTypes",
          },
          facadeAreaW: {
            key: "facadeAreaW",
            type: Number,
            label: "Façade area to the West:",
            rootPath: "buildingTypes",
          },
          roofArea: {
            key: "roofArea",
            type: Number,
            label: "Roof area:",
            rootPath: "buildingTypes",
          },
          windowAreaN: {
            key: "windowAreaN",
            type: Number,
            label: "Window area to the North:",
            rootPath: "buildingTypes",
          },
          windowAreaE: {
            key: "windowAreaE",
            type: Number,
            label: "Window area to the East:",
            rootPath: "buildingTypes",
          },
          windowAreaS: {
            key: "windowAreaS",
            type: Number,
            label: "Window area to the South:",
            rootPath: "buildingTypes",
          },
          windowAreaW: {
            key: "windowAreaW",
            type: Number,
            label: "Window area to the West:",
            rootPath: "buildingTypes",
          },
          foundationArea: {
            key: "foundationArea",
            type: Number,
            label: "Foundation area:",
            rootPath: "buildingTypes",
          },
          numberOfFloorsAbove: {
            key: "numberOfFloorsAbove",
            type: Number,
            label: "Number of floors above ground:",
            rootPath: "buildingTypes",
          },
          numberOfFloorsBelow: {
            key: "numberOfFloorsBelow",
            type: Number,
            label: "Number of floors below ground:",
            rootPath: "buildingTypes",
          },
          floorHeight: {
            key: "floorHeight",
            type: Number,
            label: "Average floor height:",
            rootPath: "buildingTypes",
          },
        }
      },
    }

    this.state = {
      buildingAdvancedOptions: buildingAdvancedOptions,
    };
  }

  handleAddBuildingTypeClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.addBuildingType();
  }

  handleExpandAdvancedOptionsClick = (e: React.MouseEvent<HTMLElement>, name: string) => {
    let newState = { ...this.state };
    newState.buildingAdvancedOptions[name].isOpen = !newState.buildingAdvancedOptions[name].isOpen;
    this.setState(newState);
  }

  render() {
    const buildingTypes = this.props.data;
    return (
      <div className="scrollable-panel-content">
        <div className="panel-list-header">
          {
            <FormGroup
              inline
              className="inline-input"
              key={`building-type-name-input`}
              label={(
                <div className="label-with-add-button">
                  <p>Building type name:</p>
                  <Button
                    minimal
                    className="bp3-button add-button"
                    icon="add"
                    onClick={this.handleAddBuildingTypeClick} />
                  
                </div>
              )}
              labelFor="building-type-name-input">
              {
                Object.keys(buildingTypes).map(id => {
                  return (
                    <InputGroup
                      key={`building-type-${id}-name-input`}
                      name={`buildingTypes.${id}.name`}
                      id={`building-type-${id}-name-input`}
                      onChange={this.props.handleChange}
                      value={buildingTypes[id].name} />
                  )
                })
              }
              <Button
                minimal
                className="bp3-button add-button"
                icon="add"
                onClick={this.handleAddBuildingTypeClick} />
            </FormGroup>
          }
          
        </div>
        
        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
            {
              Object.keys(this.state.buildingAdvancedOptions).map(id => {
                const card = this.state.buildingAdvancedOptions[id];
                const data = buildingTypes; // todo: not great that we pass all the buildingTypes data in. same issue in EnergySystemsCard
                return (
                  <div className="advanced-options-wrapper" key={`${id}-div`}>
                    <Button
                      minimal
                      className="bp3-button"
                      name={card.name}
                      icon={card.isOpen ? "arrow-up" : "arrow-down"}
                      onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandAdvancedOptionsClick(e, id)}>
                      <h4>{card.title}</h4 >
                    </Button>
                    <AdvancedOptionsCard key={id} isOpen={card.isOpen} data={data} eventHandlers={card.eventHandlers} category={id} parameters={card.parameters} />
                  </div>
                )
              })
            }
        </div>
      </div>
    )
  }
}

interface IBuildingAdvancedOptionsCardProps extends IAdvancedOptionsCardProps {
  data: IDictBuildingType;
}

const AdvancedOptionsCard = (props: IBuildingAdvancedOptionsCardProps) => {
  const buildingTypes = props.data;
  const category = props.category;
  return (
    <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
      {
        Object.keys(props.parameters).map( (paramName: string) => {
          const param = props.parameters[paramName];
          return (
            <div className={"panel-list-row"} key={`building-type-${paramName}-div`}>
              <FormGroup
                inline
                className="inline-input"
                key={`building-type-${paramName}-input`}
                label={param.label}
                labelFor={`building-type-${paramName}-input`}>
                {
                  Object.keys(buildingTypes).map(id => {
                    param.localPath = `${id}.${category}.${paramName}`;
                    const eventHandler = props.eventHandlers.handleChange as ((e: ChangeEvent<HTMLInputElement>) => void);
                    return renderInputField(`building-type-${id}`, param, buildingTypes, eventHandler)
                  })
                }
                <span className="empty-button"/>
              </FormGroup>
            </div>
          )
        })
      }
    </Collapse>
  )
}
