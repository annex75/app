// external
import React, { Component, ChangeEvent } from 'react';
import { get as _fpGet } from 'lodash/fp';
import { Button, FormGroup, Collapse } from '@blueprintjs/core';

// internal
import { IEnergySystemsCardProps, IEnergySystemParameter, IEnergySystemsCardState, ICalcDataAdvancedOptionsCard, IAdvancedOptionsCardProps, IDictEnergyCarrier, IEnergySystemDropdown } from "../../../types";
import { renderInputField, renderDropdown, } from '../../../helpers';

export class EnergySystemsCard extends Component<IEnergySystemsCardProps, IEnergySystemsCardState> {

  constructor(props: IEnergySystemsCardProps) {
    super(props);
    const energySystemsAdvancedOptions: Record<string,ICalcDataAdvancedOptionsCard> = {
      "energyCarriers": {
        name: "energyCarriers",
        title: "Energy carriers",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddEnergyCarrierClick: this.handleAddEnergyCarrierClick,
        },
        parameters: {
          name: {
            key: "name",
            type: String,
            label: "Energy carrier name:",
            rootPath: "",
          },
          primaryEnergyFactorRe: {
            key: "primaryEnergyFactorRe",
            type: Number,
            label: "Primary energy factor (renewables):",
            rootPath: "",
          },
          primaryEnergyFactorNonRe: {
            key: "primaryEnergyFactorNonRe",
            type: Number,
            label: "Primary energy factor (non-renewables):",
            rootPath: "",
          },
          emissionFactor: {
            key: "emissionFactor",
            type: String,
            label: "Emission factor:",
            rootPath: "",
          },
          currentPrice: {
            key: "currentPrice",
            type: Number,
            label: "Current price:",
            rootPath: "",
          }
        }
      },
    };
    this.state = {
      energySystemsAdvancedOptions,
    };
  }

  energySystemParameters: Record<string, IEnergySystemParameter | IEnergySystemDropdown> = {
    name: {
      key: "name",
      disabled: false,
      type: String,
      mode: "input",
      label: "System name:"
    },
    systemType: { // todo: dropdown
      key: "systemType",
      disabled: false,
      type: String,
      mode: "input",
      label: "System type:",
    },
    systemCategory: { // todo: dropdown
      key: "systemCategory",
      disabled: true,
      type: String,
      mode: "input",
      label: "System category:"
    },
    lifeTime: {
      key: "lifeTime",
      type: Number,
      mode: "input",
      label: "Life time:"
    },
    efficiency: {
      key: "efficiency",
      type: Number,
      mode: "input",
      label: "Efficiency:"
    },
    energyCarrier: {
      key: "energyCarrier",
      mode: "dropdown",
      nameKey: "name",
      optionPath: "calcData.energyCarriers",
      label: "Energy carrier:",
    }
  }

  handleExpandClick = (e: React.MouseEvent<HTMLElement>, name: string) => {
    let newState = { ...this.state };
    newState.energySystemsAdvancedOptions[name].isOpen = !newState.energySystemsAdvancedOptions[name].isOpen;
    this.setState(newState);
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
          {
            Object.keys(this.energySystemParameters).map((paramName: string, i: number) => {
              const param = this.energySystemParameters[paramName];
              return (
                <FormGroup
                  inline
                  className="inline-input"
                  key={`energy-system-${paramName}-input`}
                  label={i? param.label : (
                    <div className="label-with-add-button">
                      <p>{param.label}</p>
                      <Button
                        minimal
                        className="bp3-button add-button"
                        icon="add"
                        onClick={this.handleAddEnergySystemClick} />
                      
                    </div>
                  )}
                  labelFor={`energy-system-${paramName}-input`}>
                  {
                    Object.keys(energySystems).map(id => {
                      param.path = `energySystems.${id}.${paramName}`;
                      switch (param.mode) {
                        case "input": {
                          param.localPath = `${id}.${paramName}`;
                          const eventHandler = this.props.handleChange as ((e: ChangeEvent<HTMLInputElement>) => void);
                          return renderInputField(`energy-system-${id}`, param, energySystems, eventHandler )
                        } case "dropdown": {
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
              Object.keys(energySystems).map(id => {
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

        {
          Object.keys(this.state.energySystemsAdvancedOptions).map(id => {
            const card = this.state.energySystemsAdvancedOptions[id];
            const data = energyCarriers as IDictEnergyCarrier; // todo: not great that we pass all the energySystems data in. samme issue in BuildingTypeCard
            return (
              <div className="advanced-options-wrapper" key={`${id}-div`}>
                <Button
                  minimal
                  className="bp3-button"
                  name={card.name}
                  icon={card.isOpen ? "arrow-up" : "arrow-down"}
                  onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandClick(e, id)}>
                  <h4>{card.title}</h4 >
                </Button>
                <AdvancedOptionsCard key={id} isOpen={card.isOpen} data={data} eventHandlers={card.eventHandlers} category={id} parameters={card.parameters} />
              </div>
            )
          })
        }
      </div>
    )
  }
}

interface IEnergySystemsAdvancedOptionsCardProps extends IAdvancedOptionsCardProps {
  data: IDictEnergyCarrier;
}

const AdvancedOptionsCard = (props: IEnergySystemsAdvancedOptionsCardProps) => {
  const energyCarriers = props.data;
  const category = props.category;
  return (
    <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
      <div className="scrollable-panel-content">
      {
        Object.keys(props.parameters).map( (paramName: string, i: number) => {
          const param = props.parameters[paramName];
          return (
            <div className={"panel-list-row"} key={`energy-carriers-${paramName}-div`}>
              <FormGroup
                inline
                className="inline-input"
                key={`energy-carriers-${paramName}-input`}
                label={i? param.label : (
                  <div className="label-with-add-button">
                    <p>{param.label}</p>
                    <Button
                      minimal
                      className="bp3-button add-button"
                      icon="add"
                      onClick={(e: React.MouseEvent<HTMLElement>) => { 
                        const eventHandler = props.eventHandlers.handleAddEnergyCarrierClick as ((e: React.MouseEvent<HTMLElement>) => void);
                        eventHandler(e);
                      }}/>
                    
                  </div>
                )}
                labelFor={`energy-carriers-${paramName}-input`}>
                {
                  Object.keys(energyCarriers).map(id => {
                    param.path = `energyCarriers.${id}.${paramName}`;
                    param.localPath = `${id}.${paramName}`;
                    const eventHandler = props.eventHandlers.handleChange as ((e: React.ChangeEvent<HTMLInputElement>) => void);
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
                      const eventHandler = props.eventHandlers.handleAddEnergyCarrierClick as ((e: React.MouseEvent<HTMLElement>) => void);
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
  )
}
