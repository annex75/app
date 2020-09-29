// external
import React, { Component, ChangeEvent } from 'react';
import { get as _fpGet } from 'lodash/fp';
import { Button, FormGroup, Collapse, Position, Tooltip, Alert, Intent } from '@blueprintjs/core';

// internal
import { IEnergySystemsCardProps, IEnergySystemParameter, IEnergySystemsCardState, IEnergySystemDropdown, energySystemTypes, EnergySystemType, EnergySystemCategory, energySystemCategories, IDictBool } from "../../../types";
import { renderInputField, renderDropdown, renderInputLabel, } from '../../../helpers';

export class EnergySystemsCard extends Component<IEnergySystemsCardProps, IEnergySystemsCardState> {

  constructor(props: IEnergySystemsCardProps) {
    super(props);

    let deleteWarningOpen: IDictBool = {};
    Object.keys(props.data.energySystems).forEach((id: string) => {
      deleteWarningOpen[id] = false;
    });
    Object.keys(props.data.energyCarriers).forEach((id: string) => {
      deleteWarningOpen[id] = false;
    });

    this.state = {
      energyCarriersOpen: false,
      deleteWarningOpen,
    };
  }

  createDropdownInfo = (option: EnergySystemType | EnergySystemCategory) => {
    return {
      label: option.name || "",
      id: option.id || "",
      name: option.name || "",
      path: "", // has to be set for each energy system
    }
  }

  energySystemParameters: Record<string, IEnergySystemParameter | IEnergySystemDropdown> = {
    name: {
      key: "name",
      disabled: false,
      unit: "none",
      type: String,
      mode: "input",
      label: "System name"
    },
    systemType: {
      key: "systemType",
      nameKey: "name",
      disabled: false,
      mode: "dropdownOptions",
      options: energySystemTypes.map((option) => this.createDropdownInfo(option)),
      twoLine: true,
      label: "System type",
    },
    systemCategory: {
      key: "systemCategory",
      nameKey: "name",
      disabled: false,
      mode: "dropdownOptions",
      options: energySystemCategories.map((option) => this.createDropdownInfo(option)),
      label: "System category"
    },
    lifeTime: {
      key: "lifeTime",
      unit: "years",
      type: Number,
      mode: "input",
      label: "Life time"
    },
    efficiency: {
      key: "efficiency",
      unit: "nonDimensional",
      type: Number,
      mode: "input",
      label: "Efficiency"
    },
    energyCarrier: {
      key: "energyCarrier",
      mode: "dropdownOptionPath",
      nameKey: "name",
      optionPath: "calcData.energyCarriers",
      label: "Energy carrier",
    }
  }
  
  energyCarrierParameters: Record<string, IEnergySystemParameter> = {
    name: {
      key: "name",
      unit: "none",
      type: String,
      mode: "input",
      label: "Energy carrier name",
      rootPath: "",
    },
    /*
    primaryEnergyFactorRe: {
      key: "primaryEnergyFactorRe",
      type: Number,
      label: "Primary energy factor (renewables)",
      rootPath: "",
    },
    primaryEnergyFactorNonRe: {
      key: "primaryEnergyFactorNonRe",
      type: Number,
      label: "Primary energy factor (non-renewables)",
      rootPath: "",
    }, */
    primaryEnergyFactorTotal: {
      key: "primaryEnergyFactorTotal",
      unit: "kiloWattHourPerKiloWattHour",
      type: Number,
      mode: "input",
      label: "Primary energy factor",
      rootPath: "",
    },
    emissionFactor: {
      key: "emissionFactor",
      type: String,
      mode: "input",
      unit: "kiloGramCO2EqPerKiloWattHour",
      label: "Emission factor",
      rootPath: "",
    },
    currentPrice: {
      key: "currentPrice",
      unit: "euroPerKiloWattHour",
      type: Number,
      mode: "input",
      label: "Current price",
      rootPath: "",
    },
    projectedPrice: {
      key: "projectedPrice",
      unit: "euroPerKiloWattHour",
      type: Number,
      mode: "input",
      label: "Projected price in 2030",
      rootPath: "",
    }
  }

  handleExpandClick = () => {
    let newState = { ...this.state };
    newState.energyCarriersOpen = !newState.energyCarriersOpen;
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

  handleAlertConfirm = (id: string, mode: "energyCarrier" | "energySystem") => {
    let newState = { ...this.state };
    newState.deleteWarningOpen[id] = false;
    this.setState(newState);
    switch(mode) {
      case "energyCarrier":
        this.props.deleteEnergyCarrier(id);
        break;
      case "energySystem":
        this.props.deleteEnergySystem(id);
        break;
    }
  }

  handleAddEnergySystemClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.addEnergySystem();
  }

  handleAddEnergyCarrierClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.addEnergyCarrier();
  }

  handleEditCostCurveClick = (e: React.MouseEvent<HTMLElement>, id: string) => {
    this.props.editCostCurve(id);
  }

  handleEditSystemSizeCurveClick = (e: React.MouseEvent<HTMLElement>, id: string) => {
    this.props.editSystemSizeCurve(id);
  }
  
  render() {
    const { energySystems, energyCarriers } = this.props.data;
    return (
      <div>
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
                Object.keys(energySystems).filter(id => !energySystems[id].deleted).map(id => {
                  return (
                    <div key={`energy-systems-button-header-${id}`} className="building-type-button-header-div">
                      <Tooltip content={`Copy energy system "${energySystems[id].name}"`} position={Position.TOP}>
                        <Button onClick={() => this.props.copyEnergySystem(id)} className="bp3-minimal building-type-header-button bp3-icon-duplicate"></Button>
                      </Tooltip>
                      <Alert
                        cancelButtonText="Cancel"
                        confirmButtonText="Delete energy system"
                        intent={Intent.DANGER}
                        isOpen={this.state.deleteWarningOpen[id]}
                        onCancel={() => this.handleAlertCancel(id)}
                        onConfirm={() => this.handleAlertConfirm(id, "energySystem")}>
                        <p>
                          Are you sure you want to delete this energy system? This action is irreversible!
                        </p>
                      </Alert>
                      <Tooltip intent={Intent.WARNING} content={`Delete energy system "${energySystems[id].name}"`} position={Position.TOP}>
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
          {
            Object.keys(this.energySystemParameters).map((paramName: string, i: number) => {
              const param = this.energySystemParameters[paramName];
              return (
                <FormGroup
                  inline
                  className="inline-input"
                  key={`energy-system-${paramName}-input`}
                  label={i? renderInputLabel(param) : (
                    <div className="label-with-add-button">
                      <p>{renderInputLabel(param)}</p>
                      <Button
                        minimal
                        className="bp3-button add-button"
                        icon="add"
                        onClick={this.handleAddEnergySystemClick} />
                      
                    </div>
                  )}
                  labelFor={`energy-system-${paramName}-input`}>
                  {
                    Object.keys(energySystems).filter(id => !energySystems[id].deleted).map(id => {
                      param.path = `energySystems.${id}.${paramName}`;
                      switch (param.mode) {
                        case "input": {
                          param.localPath = `${id}.${paramName}`;
                          const eventHandler = this.props.handleChange as ((e: ChangeEvent<HTMLInputElement>) => void);
                          return renderInputField(`energy-system-${id}`, param, energySystems, eventHandler )
                        } case "dropdownOptionPath": {
                          const data = _fpGet(param.optionPath, this.props.project);
                          const alts = Object.keys(data).map((key) => {
                            const dataPoint = data[key];
                            return {
                              label: dataPoint[param.nameKey] || "",
                              id: dataPoint.id || "",
                              name: dataPoint[param.nameKey] || "",
                              path: param.path || "",
                            }
                          });

                          const selId = _fpGet(param.path, this.props.project.calcData);
                          const selected = alts.find(e => {
                            return e.id === selId;
                          }) || {
                            label: "Select...",
                            path: "",
                            id: "",
                            name: "",
                          };
                          const eventHandler = this.props.handleDropdownChange;
                          return renderDropdown(`energy-system-${paramName}-${id}`, alts, selected, param, eventHandler)
                        } case "dropdownOptions": {
                          const alts = param.options.map( option => {
                            const newOption = Object.assign({ ...option }, { path: param.path });
                            return newOption;
                          });
                          const selId = _fpGet(param.path, this.props.project.calcData);
                          const selected = alts.find(e => {
                            return e.id === selId;
                          }) || {
                            label: "Select...",
                            path: "",
                            id: "",
                            name: "",
                          };
                          const eventHandler = this.props.handleDropdownChange;
                          return renderDropdown(`energy-system-${paramName}-${id}`, alts, selected, param, eventHandler, { twoLine: param.twoLine })
                        } default: {
                          throw new Error(`Param mode is not defined`);
                        }
                      }
                    })
                  }
                  {
                  !i?  // only have an add button on the first row (i == 0)
                    <Button
                      minimal
                      className="bp3-button add-system-button"
                      icon="add"
                      onClick={this.handleAddEnergySystemClick} />
                    : <span className="empty-button"/>
                  }
                </FormGroup>
              )
            })
          }
          <FormGroup
            inline
            className="inline-input"
            label=" "
            labelFor=""
            key={`edit-cost-curve-button-form`}>
            {
              Object.keys(energySystems).filter(id => !energySystems[id].deleted).map(id => {
                return (
                  <div key={`energy-systems-button-container-${id}`} className="energy-systems-button-container">
                    <Button
                      className="bp3-button edit-cost-curve-button bp3-minimal"
                      key={`energy-system-${id}-edit-system-size-curve-button`}
                      onClick={(e: React.MouseEvent<HTMLElement>) => this.handleEditSystemSizeCurveClick(e, id)}>
                      Edit system size curve
                    </Button>
                    <Button
                      className="bp3-button edit-cost-curve-button bp3-minimal"
                      key={`energy-system-${id}-edit-cost-curve-button`}
                      onClick={(e: React.MouseEvent<HTMLElement>) => this.handleEditCostCurveClick(e, id)}>
                      Edit cost curve
                    </Button>
                  </div>
                )
              })
            }
            <span className="empty-button"/>
          </FormGroup>
        </div>
        <div className="advanced-options-wrapper" key={`energy-carrier-wrapper-div`}>
          <Button
            minimal
            className="bp3-button"
            name="energyCarriers"
            icon={this.state.energyCarriersOpen ? "arrow-up" : "arrow-down"}
            onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandClick()}>
            <h4>Energy Carriers</h4 >
          </Button>
          <Collapse key={`energy-carrier-collapse`} isOpen={this.state.energyCarriersOpen}>
            <div className="scrollable-panel-content">
              <div className="panel-list-header">
              {
                <FormGroup
                  inline
                  className="inline-input"
                  key={`energy-carriers-buttons-header`}
                  label=" "
                  labelFor={`energy-carriers-buttons-header`}>
                {
                  Object.keys(energyCarriers).filter(id => !energyCarriers[id].deleted).map(id => {
                    return (
                      <div key={`building-type-button-header-${id}`} className="building-type-button-header-div">
                        <Tooltip content={`Copy energy carrier "${energyCarriers[id].name}"`} position={Position.TOP}>
                          <Button onClick={() => this.props.copyEnergyCarrier(id)} className="bp3-minimal building-type-header-button bp3-icon-duplicate"></Button>
                        </Tooltip>
                        <Alert
                          cancelButtonText="Cancel"
                          confirmButtonText="Delete energy carrier"
                          intent={Intent.DANGER}
                          isOpen={this.state.deleteWarningOpen[id]}
                          onCancel={() => this.handleAlertCancel(id)}
                          onConfirm={() => this.handleAlertConfirm(id, "energyCarrier")}>
                          <p>
                            Are you sure you want to delete this energy carrier? This action is irreversible!
                          </p>
                        </Alert>
                        <Tooltip intent={Intent.WARNING} content={`Delete energy carrier "${energyCarriers[id].name}"`} position={Position.TOP}>
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
            
            {
              Object.keys(this.energyCarrierParameters).map((paramName: string, i: number) => {
                const param = this.energyCarrierParameters[paramName];
                return (
                  <div className={"panel-list-row"} key={`energy-carriers-${paramName}-div`}>
                    <FormGroup
                      inline
                      className="inline-input"
                      key={`energy-carriers-${paramName}-input`}
                      label={i? renderInputLabel(param) : (
                        <div className="label-with-add-button">
                          <p>{renderInputLabel(param)}</p>
                          <Button
                            minimal
                            className="bp3-button add-button"
                            icon="add"
                            onClick={(e: React.MouseEvent<HTMLElement>) => { 
                              const eventHandler = this.handleAddEnergyCarrierClick as ((e: React.MouseEvent<HTMLElement>) => void);
                              eventHandler(e);
                            }}/>
                          
                        </div>
                      )}
                      labelFor={`energy-carriers-${paramName}-input`}>
                      {
                        Object.keys(energyCarriers).filter(id => !energyCarriers[id].deleted).map(id => {
                          param.path = `energyCarriers.${id}.${paramName}`;
                          param.localPath = `${id}.${paramName}`;
                          const eventHandler = this.props.handleChange as ((e: React.ChangeEvent<HTMLInputElement>) => void);
                          return renderInputField(`energy-carriers-${id}`, param, energyCarriers, eventHandler)
                        })
                      }
                      {
                      !i?  // only have an add button on the first row (i == 0)
                        <Button
                          minimal
                          className="bp3-button add-button"
                          icon="add"
                          onClick={(e: React.MouseEvent<HTMLElement>) => { 
                            const eventHandler = this.handleAddEnergyCarrierClick as ((e: React.MouseEvent<HTMLElement>) => void);
                            eventHandler(e);
                          }}/>
                        : <span className="empty-button"/>
                      }
                    </FormGroup>
                  </div>
                )
              })
            }
            </div>
          </Collapse>
        </div>
      </div>
    )
  }
}

