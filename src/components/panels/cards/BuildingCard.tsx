import React, { Component } from "react"
import { IBuildingCardProps, IBuildingCardState, IBuildingAdvancedOptionsCard } from "../../../types";
import { FormGroup, Button, InputGroup, Collapse } from "@blueprintjs/core";

export class BuildingCard extends Component<IBuildingCardProps, IBuildingCardState> {

  constructor(props: IBuildingCardProps) {
    super(props);

    const buildingAdvancedOptions: Record<string,IBuildingAdvancedOptionsCard> = {
      "buildingTypeInformation": {
        name: "buildingTypeInformation",
        title: "Building type information",
        isOpen: false,
        component: BuildingTypeInformationCard,
        eventHandlers: {
          handleChange: this.props.handleChange,
        }
      },
      "buildingGeometryInformation": {
        name: "buildingGeometryInformation",
        title: "Geometry",
        isOpen: false,
        component: BuildingGeometryCard,
        eventHandlers: {
          handleChange: this.props.handleChange,
        }
      },
      "buildingOccupancyInformation": {
        name: "buildingOccupancyInformation",
        title: "Occupancy and usage",
        isOpen: false,
        component: BuildingOccupancyCard,
        eventHandlers: {
          handleChange: this.props.handleChange,
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
            buildings ? (
              <FormGroup
                inline
                className="building-input"
                key={`building-name-input`}
                label="Building name"
                labelFor="building-name-input"
                style={{display: "flex", flexDirection: "row"}}>
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
              )
              : (<p>No buildings have been added</p>)
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
                    <AdvancedOptionsCard key={id} isOpen={card.isOpen} component={card.component} data={data} {...card.eventHandlers} />
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

const AdvancedOptionsCard = ({ component: Component, ...rest }: any) => {
  return <Component {...rest} />
}

export interface IAdvancedOptionsCardProps {
  isOpen: boolean;
  data: any;
}

export interface IAdvancedOptionsCardState {
  data: any;
  isOpen: boolean;
}

const BuildingTypeInformationCard = (props: IAdvancedOptionsCardProps) => {
  return (
    <div>
      <Collapse key={`building-information-collapse`} isOpen={props.isOpen}>
        Hello world!
      </Collapse>
    </div>
  )
}

const BuildingGeometryCard = (props: IAdvancedOptionsCardProps) => {
  return (
    <div>
      <Collapse key={`building-geometry-collapse`} isOpen={props.isOpen}>
        Hello world!
      </Collapse>
    </div>
  )
}

const BuildingOccupancyCard = (props: IAdvancedOptionsCardProps) => {
  return (
    <div>
      <Collapse key={`building-occupancy-collapse`} isOpen={props.isOpen}>
        Hello world!
      </Collapse>
    </div>
  )
}