import React, { Component, ChangeEvent } from "react"

import { IBuildingTypeCardProps, IBuildingTypeCardState, IBuildingAdvancedOptionsCard, IAdvancedOptionsCardProps, IDictBuildingType, IDictBool } from "../../../types";
import { renderInputField, renderInputLabel } from '../../../helpers'

import { FormGroup, Button, InputGroup, Collapse, Tooltip, Position, Intent, Alert } from "@blueprintjs/core";

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
            unit: "none",
            type: Number,
            label: "Construction year",
            rootPath: "buildingTypes",
          },
          energyPerformanceCertificate: {
            key: "energyPerformanceCertificate",
            unit: "none",
            info: "E.g. LEED, BREEAM, etc.",
            type: String,
            label: "Energy performance certificates",
            rootPath: "buildingTypes",
          },
          ownership: {
            key: "ownership",
            info: "E.g. private, public, etc.",
            unit: "none",
            type: String,
            label: "Ownership",
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
            unit: "meterSq",
            info: "Gross heated floor area, including exterior walls, stairwells, and other heated spaces",
            type: Number,
            label: "Gross heated floor area",
            rootPath: "buildingTypes",
          },
          heatedVolume: {
            key: "heatedVolume",
            unit: "meterCubed",
            info: "Air volume of heated spaces",
            type: Number,
            label: "Heated volume",
            rootPath: "buildingTypes",
          },
          facadeAreaN: {
            key: "facadeAreaN",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the North",
            rootPath: "buildingTypes",
          },
          facadeAreaE: {
            key: "facadeAreaE",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the East",
            rootPath: "buildingTypes",
          },
          facadeAreaS: {
            key: "facadeAreaS",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the South",
            rootPath: "buildingTypes",
          },
          facadeAreaW: {
            key: "facadeAreaW",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the West",
            rootPath: "buildingTypes",
          },
          roofArea: {
            key: "roofArea",
            unit: "meterSq",
            type: Number,
            label: "Roof area",
            rootPath: "buildingTypes",
          },
          windowAreaN: {
            key: "windowAreaN",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the North",
            rootPath: "buildingTypes",
          },
          windowAreaE: {
            key: "windowAreaE",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the East",
            rootPath: "buildingTypes",
          },
          windowAreaS: {
            key: "windowAreaS",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the South",
            rootPath: "buildingTypes",
          },
          windowAreaW: {
            key: "windowAreaW",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the West",
            rootPath: "buildingTypes",
          },
          basementFloorArea: {
            key: "basementFloorArea",
            unit: "meterSq",
            info: "Equal to building footprint",
            type: Number,
            label: "Foundation area",
            rootPath: "buildingTypes",
          },
          basementWallArea: {
            key: "basementFloorArea",
            unit: "meterSq",
            info: "Area in all directions",
            type: Number,
            label: "Basement wall area",
            rootPath: "buildingTypes",
          },
          numberOfFloorsAbove: {
            key: "numberOfFloorsAbove",
            unit: "none",
            type: Number,
            label: "Number of floors above ground",
            rootPath: "buildingTypes",
          },
          numberOfFloorsBelow: {
            key: "numberOfFloorsBelow",
            unit: "none",
            type: Number,
            label: "Number of floors below ground",
            rootPath: "buildingTypes",
          },
          floorHeight: {
            key: "floorHeight",
            unit: "meter",
            info: "Floor height including slab thickness",
            type: Number,
            label: "Average floor height",
            rootPath: "buildingTypes",
          },
        }
      },
      "buildingThermalProperties": {
        name: "buildingThermalProperties",
        title: "Thermal properties",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
        },
        parameters: {
          buildingClass: {
            key: "buildingClass",
            unit: "none",
            info: "Thermal mass of principal building components",
            type: String,
            label: "Building class",
            rootPath: "buildingTypes",
          },
          grossFloorArea: {
            key: "grossFloorArea",
            unit: "meterSq",
            info: "Gross heated floor area, including exterior walls, stairwells, and other heated spaces",
            type: Number,
            label: "Gross heated floor area",
            rootPath: "buildingTypes",
          },
        }
      },
    }

    let deleteBuildingTypeWarningOpen: IDictBool = {};
    Object.keys(props.data).forEach((id: string) => {
      deleteBuildingTypeWarningOpen[id] = false;
    });

    this.state = {
      buildingAdvancedOptions,
      deleteBuildingTypeWarningOpen,
    };
  }

  handleAlertOpen = (id: string) => {
    let newState = { ...this.state };
    newState.deleteBuildingTypeWarningOpen[id] = true;
    this.setState(newState);
  }

  // todo: cancel and confirm could share function
  handleAlertCancel = (id: string) => {
    let newState = { ...this.state };
    newState.deleteBuildingTypeWarningOpen[id] = false;
    this.setState(newState);
  }

  handleAlertConfirm = (id: string) => {
    let newState = { ...this.state };
    newState.deleteBuildingTypeWarningOpen[id] = false;
    this.setState(newState);
    this.props.deleteBuildingType(id);
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
              key={`building-type-buttons-header`}
              label=" "
              labelFor={`building-type-buttons-header`}>
            {
              Object.keys(buildingTypes).filter(id => !buildingTypes[id].deleted).map(id => {
                return (
                  <div key={`building-type-button-header-${id}`} className="building-type-button-header-div">
                    <Tooltip content={`Copy building type "${buildingTypes[id].name}"`} position={Position.TOP}>
                      <Button onClick={() => this.props.copyBuildingType(id)} className="bp3-minimal building-type-header-button bp3-icon-duplicate"></Button>
                    </Tooltip>
                    <Alert
                      cancelButtonText="Cancel"
                      confirmButtonText="Delete building type"
                      intent={Intent.DANGER}
                      isOpen={this.state.deleteBuildingTypeWarningOpen[id]}
                      onCancel={() => this.handleAlertCancel(id)}
                      onConfirm={() => this.handleAlertConfirm(id)}>
                      <p>
                        Are you sure you want to delete this building type? This action is irreversible!
                      </p>
                    </Alert>
                    <Tooltip intent={Intent.WARNING} content={`Delete building type "${buildingTypes[id].name}"`} position={Position.TOP}>
                      <Button className="bp3-minimal building-type-header-button bp3-icon-delete" onClick={() => this.handleAlertOpen(id)}></Button>
                    </Tooltip>
                  </div>
                )
              })
            }
            <span className="empty-button"/>
          </FormGroup>
          }
        </div>
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
                Object.keys(buildingTypes).filter(id => !buildingTypes[id].deleted).map(id => {
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
                label={renderInputLabel(param)}
                labelFor={`building-type-${paramName}-input`}>
                {
                  Object.keys(buildingTypes).filter(id => !buildingTypes[id].deleted).map(id => {
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
