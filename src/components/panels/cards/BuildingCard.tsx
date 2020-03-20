import React, { Component } from "react"

import { IBuildingCardProps, IBuildingCardState, IBuildingAdvancedOptionsCard, IAdvancedOptionsCardProps, IDictBuilding } from "../../../types";
import { renderInputField } from '../../../helpers'

import { FormGroup, Button, InputGroup, Collapse } from "@blueprintjs/core";

export class BuildingCard extends Component<IBuildingCardProps, IBuildingCardState> {

  constructor(props: IBuildingCardProps) {
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
            rootPath: "buildings",
          },
          buildingClass: {
            key: "buildingClass",
            type: Number,
            label: "Building class:",
            rootPath: "buildings",
          },
          energyPerformanceCertificate: {
            key: "energyPerformanceCertificate",
            type: String,
            label: "Energy performance certificates:",
            rootPath: "buildings",
          },
          ownership: {
            key: "ownership",
            type: String,
            label: "Ownership:",
            rootPath: "buildings",
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
            rootPath: "buildings",
          },
          heatedVolume: {
            key: "heatedVolume",
            type: Number,
            label: "Heated volume:",
            rootPath: "buildings",
          },
          facadeAreaN: {
            key: "facadeAreaN",
            type: Number,
            label: "Façade area to the North:",
            rootPath: "buildings",
          },
          facadeAreaE: {
            key: "facadeAreaE",
            type: Number,
            label: "Façade area to the East:",
            rootPath: "buildings",
          },
          facadeAreaS: {
            key: "facadeAreaS",
            type: Number,
            label: "Façade area to the South:",
            rootPath: "buildings",
          },
          facadeAreaW: {
            key: "facadeAreaW",
            type: Number,
            label: "Façade area to the West:",
            rootPath: "buildings",
          },
          roofArea: {
            key: "roofArea",
            type: Number,
            label: "Roof area:",
            rootPath: "buildings",
          },
          windowAreaN: {
            key: "windowAreaN",
            type: Number,
            label: "Window area to the North:",
            rootPath: "buildings",
          },
          windowAreaE: {
            key: "windowAreaE",
            type: Number,
            label: "Window area to the East:",
            rootPath: "buildings",
          },
          windowAreaS: {
            key: "windowAreaS",
            type: Number,
            label: "Window area to the South:",
            rootPath: "buildings",
          },
          windowAreaW: {
            key: "windowAreaW",
            type: Number,
            label: "Window area to the West:",
            rootPath: "buildings",
          },
          foundationArea: {
            key: "foundationArea",
            type: Number,
            label: "Foundation area:",
            rootPath: "buildings",
          },
          numberOfFloorsAbove: {
            key: "numberOfFloorsAbove",
            type: Number,
            label: "Number of floors above ground:",
            rootPath: "buildings",
          },
          numberOfFloorsBelow: {
            key: "numberOfFloorsBelow",
            type: Number,
            label: "Number of floors below ground:",
            rootPath: "buildings",
          },
          floorHeight: {
            key: "floorHeight",
            type: Number,
            label: "Average floor height:",
            rootPath: "buildings",
          },
        }
      },
      /* modify in scenarios
      "buildingOccupancy": {
        name: "buildingOccupancy",
        title: "Occupancy and usage",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
        },
        parameters: {
          occupancy: {
            key: "occupancy",
            type: String,
            label: "Occupancy:",
            rootPath: "buildings",
          },
          occupants: {
            key: "occupants",
            type: Number,
            label: "Occupants:",
            rootPath: "buildings",
          }
        }
      },
      */
    }

    this.state = {
      advancedIsOpen: false,
      buildingAdvancedOptions: buildingAdvancedOptions,
    };
  }

  handleExpandClick = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({ advancedIsOpen: !this.state.advancedIsOpen });
  }

  handleAddBuildingClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.addBuilding();
  }

  handleExpandAdvancedOptionsClick = (e: React.MouseEvent<HTMLElement>, name: string) => {
    let newState = { ...this.state };
    newState.buildingAdvancedOptions[name].isOpen = !newState.buildingAdvancedOptions[name].isOpen;
    this.setState(newState);
  }

  render() {
    const buildings = this.props.data;
    return (
      <div>
        <div className="panel-list-header">
          {
            <FormGroup
              inline
              className="inline-input"
              key={`building-name-input`}
              label="Building name:"
              labelFor="building-name-input">
              {
                Object.keys(buildings).map(id => {
                  return (
                    <InputGroup
                      key={`building-${id}-name-input`}
                      name={`buildings.${id}.name`}
                      id={`building-${id}-name-input`}
                      onChange={this.props.handleChange}
                      value={buildings[id].name} />
                  )
                })
              }
            </FormGroup>
          }
          <Button
            minimal
            className="bp3-button add-building-button"
            icon="add"
            onClick={this.handleAddBuildingClick} />
        </div>
        
        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
          <Button
            minimal
            className="bp3-button"
            icon={this.state.advancedIsOpen ? "arrow-up" : "arrow-down"}
            onClick={this.handleExpandClick}>
            <h4>Advanced</h4>
          </Button>
          <Collapse key="building-advanced-collapse" isOpen={this.state.advancedIsOpen}>
            {
              Object.keys(this.state.buildingAdvancedOptions).map(id => {
                const card = this.state.buildingAdvancedOptions[id];
                const data = buildings; // todo: not great that we pass all the buildings data in. same issue in EnergySystemsCard
                return (
                  <div className="building-advanced-options-wrapper" key={`${id}-div`}>
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
          </Collapse>
        </div>
      </div>
    )
  }
}

interface IBuildingAdvancedOptionsCardProps extends IAdvancedOptionsCardProps {
  data: IDictBuilding;
}

const AdvancedOptionsCard = (props: IBuildingAdvancedOptionsCardProps) => {
  const buildings = props.data;
  const category = props.category;
  return (
    <div>
      <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
        {
          Object.keys(props.parameters).map( (paramName: string) => {
            const param = props.parameters[paramName];
            return (
              <div className={"panel-list-row"} key={`building-${paramName}-div`}>
                <FormGroup
                  inline
                  className="inline-input"
                  key={`building-${paramName}-input`}
                  label={param.label}
                  labelFor={`building-${paramName}-input`}>
                  {
                    Object.keys(buildings).map(id => {
                      param.localPath = `${id}.${category}.${paramName}`;
                      return renderInputField(`building-${id}`, param, buildings, props.eventHandlers.handleChange)
                    })
                  }
                  <span className="empty-button"/>
                </FormGroup>
              </div>
            )
          })
        }
      </Collapse>
    </div>
  )
}
