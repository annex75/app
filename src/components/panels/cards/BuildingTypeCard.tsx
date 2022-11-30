import React, { Component, ChangeEvent } from "react"
import { get as _fpGet } from 'lodash/fp';

import { IBuildingTypeCardProps, IBuildingTypeCardState, IBuildingAdvancedOptionsCard, IAdvancedOptionsCardProps, IDictBuildingType, IDictBool, IBuildingInfoParameter, IBuildingInfoDropdownOptions, BuildingClass, buildingClasses } from "../../../types";
import { renderInputField, renderDropdown, renderInputLabel, IDropdownAlt } from '../../../helpers'

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
            mode: "input",
          },
          energyPerformanceCertificate: {
            key: "energyPerformanceCertificate",
            unit: "none",
            info: "E.g. LEED, BREEAM, etc.",
            type: String,
            label: "Energy performance certificates",
            rootPath: "buildingTypes",
            mode: "input",
          },
          ownership: {
            key: "ownership",
            info: "E.g. private, public, etc.",
            unit: "none",
            type: String,
            label: "Ownership",
            rootPath: "buildingTypes",
            mode: "input",
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
            mode: "input",
          },
          heatedVolume: {
            key: "heatedVolume",
            unit: "meterCubed",
            info: "Air volume of heated spaces",
            type: Number,
            label: "Heated volume",
            rootPath: "buildingTypes",
            mode: "input",
          },
          perimeter: {
            key: "perimeter",
            unit: "meter",
            info: "Exterior length of building perimeter",
            type: Number,
            label: "Perimeter",
            rootPath: "buildingTypes",
            mode: "input",
          },
          facadeAreaN: {
            key: "facadeAreaN",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the North",
            rootPath: "buildingTypes",
            mode: "input",
          },
          facadeAreaE: {
            key: "facadeAreaE",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the East",
            rootPath: "buildingTypes",
            mode: "input",
          },
          facadeAreaS: {
            key: "facadeAreaS",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the South",
            rootPath: "buildingTypes",
            mode: "input",
          },
          facadeAreaW: {
            key: "facadeAreaW",
            unit: "meterSq",
            info: "Façade area including windows",
            type: Number,
            label: "Façade area to the West",
            rootPath: "buildingTypes",
            mode: "input",
          },
          roofArea: {
            key: "roofArea",
            unit: "meterSq",
            type: Number,
            label: "Roof area",
            rootPath: "buildingTypes",
            mode: "input",
          },
          windowAreaN: {
            key: "windowAreaN",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the North",
            rootPath: "buildingTypes",
            mode: "input",
          },
          windowAreaE: {
            key: "windowAreaE",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the East",
            rootPath: "buildingTypes",
            mode: "input",
          },
          windowAreaS: {
            key: "windowAreaS",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the South",
            rootPath: "buildingTypes",
            mode: "input",
          },
          windowAreaW: {
            key: "windowAreaW",
            unit: "meterSq",
            info: "Window area including frames",
            type: Number,
            label: "Window area to the West",
            rootPath: "buildingTypes",
            mode: "input",
          },
          basementFloorArea: {
            key: "basementFloorArea",
            unit: "meterSq",
            info: "Equal to building footprint",
            type: Number,
            label: "Foundation area",
            rootPath: "buildingTypes",
            mode: "input",
          },
          basementWallArea: {
            key: "basementWallArea",
            unit: "meterSq",
            info: "Area in all directions",
            type: Number,
            label: "Basement wall area",
            rootPath: "buildingTypes",
            mode: "input",
          },
          numberOfFloorsAbove: {
            key: "numberOfFloorsAbove",
            unit: "none",
            type: Number,
            label: "Number of floors above ground",
            rootPath: "buildingTypes",
            mode: "input",
          },
          numberOfFloorsBelow: {
            key: "numberOfFloorsBelow",
            unit: "none",
            type: Number,
            label: "Number of floors below ground",
            rootPath: "buildingTypes",
            mode: "input",
          },
          floorHeight: {
            key: "floorHeight",
            unit: "meter",
            info: "Floor height including slab thickness",
            type: Number,
            label: "Average floor height",
            rootPath: "buildingTypes",
            mode: "input",
          },
        }
      },
      "buildingThermalProperties": {
        name: "buildingThermalProperties",
        title: "Thermal properties",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleDropdownChange: this.props.handleDropdownChange,
        },
        parameters: {
          buildingClass: {
            key: "buildingClass",
            info: "Thermal mass of principal building components",
            label: "Building class",
            mode: "dropdownOptions",
            nameKey: "name",
            options: buildingClasses.map((option) => this.createDropdownInfo(option)),
          },
          facadeUValue: {
            key: "facadeUValue",
            unit: "wattPerMeterSqKelvin",
            info: "Average heat transfer coefficient of all façades",
            type: String,
            label: "Façade U-value",
            rootPath: "buildingTypes",
            mode: "input",
          },
          windowUValue: {
            key: "windowUValue",
            unit: "wattPerMeterSqKelvin",
            info: "Average heat transfer coefficient of all windows",
            type: String,
            label: "Window U-value",
            rootPath: "buildingTypes",
            mode: "input",
          },
          roofUValue: {
            key: "roofUValue",
            unit: "wattPerMeterSqKelvin",
            info: "Average heat transfer coefficient of all roofs",
            type: String,
            label: "Roof U-value",
            rootPath: "buildingTypes",
            mode: "input",
          },
          basementWallUValue: {
            key: "basementWallUValue",
            unit: "wattPerMeterSqKelvin",
            info: "Average heat transfer coefficient of all basement walls",
            type: String,
            label: "Basement wall U-value",
            rootPath: "buildingTypes",
            mode: "input",
          },
          foundationUValue: {
            key: "foundationUValue",
            unit: "wattPerMeterSqKelvin",
            info: "Average heat transfer coefficient of the building foundation",
            type: String,
            label: "Foundation U-value",
            rootPath: "buildingTypes",
            mode: "input",
          },
          designIndoorTemperature: {
            key: "designIndoorTemperature",
            unit: "degC",
            //info: "",
            type: String,
            label: "Design indoor temperature (winter case)",
            rootPath: "buildingTypes",
            mode: "input",
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

  createDropdownInfo = (option: BuildingClass) => {
    return {
      label: option.name || "",
      id: option.id || "",
      name: option.name || "",
      path: "", // has to be set for each energy system
    }
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
  parameters: Record<string, IBuildingInfoParameter | IBuildingInfoDropdownOptions>;
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
                    param.path = `buildingTypes.${id}.${category}.${paramName}`;
                    // todo: this code also exists in EnergySystemsCard. Refactor!
                    switch (param.mode) {
                      case "input": {
                        param.localPath = `${id}.${category}.${paramName}`;
                        const eventHandler = props.eventHandlers.handleChange as ((e: ChangeEvent<HTMLInputElement>) => void);
                        return renderInputField(`building-type-${id}`, param, buildingTypes, eventHandler)
                      } case "dropdownOptions": {
                        param.localPath = `${id}.${category}.${paramName}`;
                        const alts = param.options.map(option => {
                          const newOption = Object.assign({ ...option }, { path: param.path });
                          return newOption;
                        });
                        // Todo: no idea why i have to do this to make it work
                        const selId = _fpGet(param.localPath, buildingTypes as Object);
                        const selected = alts.find(e => {
                          return e.id === selId;
                        }) || {
                          label: "Select...",
                          path: "",
                          id: "",
                          name: "",
                        };
                        const eventHandler = props.eventHandlers.handleDropdownChange as ((item: IDropdownAlt) => void);
                        return renderDropdown(`building-type-${paramName}-${id}`, alts, selected, eventHandler, { twoLine: param.twoLine })
                      } default: {
                        throw new Error(`Param mode is not defined`);
                      }
                    }
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
