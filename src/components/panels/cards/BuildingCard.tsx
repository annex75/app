import React, { Component } from "react"
import { IBuildingCardProps, IBuildingCardState, IBuildingAdvancedOptionsCard, IDictEventHandler, IBuildingInfo, IDictBuilding, BuildingGeometry, BuildingInformation, BuildingOccupancy } from "../../../types";
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
            type: Number,
            label: "Construction year:",
          },
          energyPerformanceCertificate: {
            type: String,
            label: "Energy performance certificates:",
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
            type: Number,
            label: "Gross heated floor area:"
          }
        }
      },
      "buildingOccupancy": {
        name: "buildingOccupancy",
        title: "Occupancy and usage",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
        },
        parameters: {
          occupants: {
            type: Number,
            label: "Occupants:",
          }
        }
      },
    }

    this.state = {
      advancedIsOpen: false,
      buildingAdvancedOptions: buildingAdvancedOptions,
    }
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
        <div className="building-list-header">
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
            Advanced
          </Button>
          <Collapse key="building-advanced-collapse" isOpen={this.state.advancedIsOpen}>
            {
              Object.keys(this.state.buildingAdvancedOptions).map(id => {
                const card = this.state.buildingAdvancedOptions[id];
                const data = buildings; // todo: not great that we pass all the buildings data in
                return (
                  <div className="building-advanced-options-wrapper" key={`${id}-div`}>
                    <Button
                      minimal
                      className="bp3-button"
                      name={card.name}
                      icon={card.isOpen ? "arrow-up" : "arrow-down"}
                      onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandAdvancedOptionsClick(e, id)}>
                      {card.title}
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

interface IAdvancedOptionsCardProps {
  isOpen: boolean;
  data: IDictBuilding;
  eventHandlers: IDictEventHandler;
  category: string;
  parameters: Record<string,IBuildingInfo>;
}

type AdvancedBuildingOptionsCategory = BuildingGeometry | BuildingInformation | BuildingOccupancy;

const AdvancedOptionsCard = (props: IAdvancedOptionsCardProps) => {
  const buildings = props.data;
  const category = props.category;
  return (
    <div>
      <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
        {
          Object.keys(props.parameters).map( (param: string) => {
            return (
              <FormGroup
                inline
                className="inline-input"
                key={`building-${param}-input`}
                label={props.parameters[param].label}
                labelFor={`building-${param}-input`}>
                {
                  Object.keys(buildings).map(id => {
                    const c = buildings[id][category] as AdvancedBuildingOptionsCategory;
                    if (!c.hasOwnProperty(param)) {
                      throw Error(`Building ${id} does not have parameter ${param}`);
                    }
                    switch(props.parameters[param].type) {
                      case Number:
                        return (
                          //todo: we can't handle numeric inputs here yet!
                          <InputGroup
                            key={`building-${id}-${category}-${param}-input`}
                            name={`buildings.${id}.${category}.${param}`}
                            id={`building-${id}-${param}-input`}
                            onChange={props.eventHandlers.handleChange}
                            value={c[param] as string} />
                        )
                      case String:
                        return (
                          <InputGroup
                            key={`building-${id}-${category}-${param}-input`}
                            name={`buildings.${id}.${category}.${param}`}
                            id={`building-${id}-${param}-input`}
                            onChange={props.eventHandlers.handleChange}
                            value={c[param] as string} />
                        )
                      default:
                        throw Error(`this data type: ${props.parameters[param].type} has not been defined`);
                    }
                  })
                }
                <span className="empty-button"/>
              </FormGroup>
            )
          })
        }
      </Collapse>
    </div>
  )
}
