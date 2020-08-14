import React, { Component, ChangeEvent } from 'react';
import { set as _fpSet, get as _fpGet, equals as _fpEquals } from 'lodash/fp';
import { pickBy as _pickBy, debounce as _debounce } from 'lodash';

import * as config from '../../config.json';
import { IScenariosPanelProps, IScenariosPanelState, Scenario, IScenarioOptionsCard, ScenarioInfo, TScenarioParamCategory, IScenarioInput, } from '../../types';
import { InputGroup, FormGroup, Button, Intent, Collapse } from '@blueprintjs/core';
import { AppToaster } from '../../toaster';
import { renderInputField, renderDropdown, IDropdownAlt } from '../../helpers';

export class ScenariosPanel extends Component<IScenariosPanelProps, IScenariosPanelState> {
  constructor(props: IScenariosPanelProps) {
    super(props);
    const project = props.project;
    const isOpen: Record<string,boolean> = {}
    for (const id of Object.keys(project.calcData.buildingTypes)) {
      isOpen[id] = false;
    }
    const scenarioOptions: IScenarioOptionsCard = {
      eventHandlers: { handleChange: this.handleChange },
      isOpen: isOpen,
      paramCategories: {
        buildingType: {
          label: "Building type options",
          global: false,
          parameters: {
            numberOfBuildings: {
              key: "numberOfBuildings",
              type: Number,
              mode: "input",
              rootPath: "calcData.buildingTypes",
              label: "Number of buildings:",
            },
            heatingNeed: {
              key: "heatingNeed",
              type: Number,
              mode: "input",
              label: "Heating need [kWh/a]:",
              rootPath: "calcData.buildingTypes",
            },
            occupancy: {
              key: "occupancy",
              type: String,
              mode: "input",
              rootPath: "calcData.buildingTypes",
              label: "Occupancy:"
            },
            occupants: {
              key: "occupants",
              type: Number,
              mode: "input",
              rootPath: "calcData.buildingTypes",
              label: "Number of occupants:",
            },
            setPointTemp: {
              key: "setPointTemp",
              type: Number,
              mode: "input",
              rootPath: "calcData.buildingTypes",
              label: "Set point temperature (heating):",
            },
            appliancesElectricityUsage: {
              key: "appliancesElectricityUsage",
              type: Number,
              mode: "input",
              rootPath: "calcData.buildingTypes",
              label: "Domestic electricity usage:",
            },
            domesticHotWaterUsage: {
              key: "domesticHotWaterUsage",
              type: Number,
              mode: "input",
              rootPath: "calcData.buildingTypes",
              label: "Domestic hot water usage:",
            },

          }
        },
        economy: {
          label: "Economic parameters",
          global: true,
          parameters: {
            interestRate: {
              key: "interestRate",
              type: Number,
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Interest rate:",
            },
            energyPriceIncrease: {
              key: "energyPriceIncrease",
              type: Number,
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Annual energy price increase:",
            },
            calculationPeriod: {
              key: "calculationPeriod",
              type: Number,
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Calculation period:"
            },
          }
        },
        energySystem: {
          label: "Energy system options",
          global: false,
          parameters: {
            energySystem: {
              key: "energySystem",
              nameKey: "name",
              optionPath: "calcData.energySystems",
              mode: "dropdown",
              label: "Energy system:",
            },
          },
        },
        buildingMeasures: {
          label: "Building renovation measures",
          global: false,
          parameters: {
            roof: {
              key: "roof",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.roof",
              mode: "dropdown",
              label: "Roof:",
            },
            facade: {
              key: "facade",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.facade",
              mode: "dropdown",
              label: "Façade:",
            },
            foundation: {
              key: "foundation",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.foundation",
              mode: "dropdown",
              label: "Foundation:",
            },
            windows: {
              key: "windows",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.windows",
              mode: "dropdown",
              label: "Windows:",
            },
            hvac: {
              key: "hvac",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.hvac",
              mode: "dropdown",
              label: "HVAC system:",
            }
          }
        },
      },
    }

    this.state = {
      project,
      scenarioOptions,
    }
  }

  componentDidUpdate(prevProps: IScenariosPanelProps) {
    if (!_fpEquals(prevProps, this.props)) {
      this.setState({ project: this.props.project, });
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const path = this.formatPath(e.target.name);
    const newState = _fpSet(path, e.target.value, this.state);
    this.setState(newState, () => {
      this.updateProject();
    });
  }
  updateProject = () => this.props.updateProject(this.state.project);
  updateProjectDebounce = _debounce(this.updateProject, 1000);

  // takes a subpath and returns its location in the main data structure
  formatPath = (childPath: string) => {
    return `project.${childPath}`;
  }

  handleDropdownChange = (item: IDropdownAlt) => {
    const path = this.formatPath(item.path);
    const newState = _fpSet(path, item.id, this.state);
    this.setState(newState);
    this.updateProjectDebounce();
  }

  handleAddScenarioClick = (e: React.MouseEvent<HTMLElement>) => {
    this.addScenario();
  }

  addScenario = () => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.scenarioData.scenarios).length >= config.MAX_SCENARIOS) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_SCENARIOS} scenarios are currently allowed`});
      return;
    }
    
    const scenario = new Scenario();
    newState.project.scenarioData.scenarios[scenario.id] = scenario;
    for (const buildingTypeId in newState.project.calcData.buildingTypes) {
      let buildingType = newState.project.calcData.buildingTypes[buildingTypeId];
      buildingType.scenarioInfos[scenario.id] = new ScenarioInfo();
    } 
    
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  handleExpandClick = (buildingId: string) => {
    let newState = { ...this.state };
    newState.scenarioOptions.isOpen[buildingId] = !newState.scenarioOptions.isOpen[buildingId];

    this.setState(newState);
  }

  createValidator = (path: string, name: string, key: string) => {
    return (val: string) => {
      const obj = _fpGet(path, this.state);
      return {
        valid: Object.keys(_pickBy(obj, (e) => { return e[key] === val })).length === 1,
        invalidMsg: `No unique ${name} with the name ${val} could be found in the project`,
      }
    }
  }

  render() {
    const project = this.state.project;
    const scenarios = project.scenarioData.scenarios;
    const buildingTypes = project.calcData.buildingTypes;
    return (
      <div>
        <h1>{this.props.title}</h1>
        <div id="scenarios-card" className="bp3-card panel-card">
          <div className="scrollable-panel-content">
            <div className="panel-list-header">
              {
                <FormGroup
                  inline
                  className="inline-input"
                  key={`scenario-name-input`}
                  label={(
                    <div className="label-with-add-button">
                      <p>Scenario name:</p>
                      <Button
                        minimal
                        className="bp3-button add-button"
                        icon="add"
                        onClick={this.handleAddScenarioClick} />
                      
                    </div>
                  )}
                  labelFor="scenario-name-input">
                  {
                    Object.keys(scenarios).map(id => {
                      return (
                        <InputGroup
                          key={`scenario-${id}-name-input`}
                          name={`scenarioData.scenarios.${id}.name`}
                          id={`scenario-${id}-name-input`}
                          onChange={this.handleChange}
                          value={scenarios[id].name} />
                      )
                    })
                  }
                </FormGroup>
              }
              <Button
                minimal
                className="bp3-button add-button"
                icon="add"
                onClick={this.handleAddScenarioClick} />
            </div>
            {
              // for each parameter category
              Object.keys(this.state.scenarioOptions.paramCategories).map(paramCategoryName => {
                const paramCategory = this.state.scenarioOptions.paramCategories[paramCategoryName as TScenarioParamCategory];
                return !paramCategory.global? (null) : (
                  <div key={`scenario-global-${paramCategoryName}-div`}>
                    <h3 key={`scenario-global-${paramCategoryName}-header`}>{paramCategory.label}</h3>
                    {
                      Object.keys(paramCategory.parameters).map(paramName => {
                        const param = paramCategory.parameters[paramName] as IScenarioInput;
                        return (
                          <div key={`scenario-global-${paramName}-div`} className="panel-list-row">
                            <FormGroup
                              inline
                              className="inline-input"
                              key={`scenario-global-${paramName}-input`}
                              label={param.label}
                              labelFor={`scenario-global-${paramName}-input`}>
                              {
                                Object.keys(scenarios).map(id => {
                                  param.localPath = `${id}.${paramCategoryName}.${paramName}`;
                                  return renderInputField(`scenario-global-${paramName}-${id}`, param, scenarios, this.handleChange)
                                })
                              }
                              <span className="empty-button"/>
                            </FormGroup>
                          </div>
                        )                        
                      })
                    }
                  </div>
                )
              })
            }
            {
              // for each building type
              Object.keys(buildingTypes).filter(key => !buildingTypes[key].deleted).map((buildingTypeId: string) => {
                return (
                  <div key={`scenario-${buildingTypeId}-div`} style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
                    <Button
                      minimal
                      className="bp3-button"
                      key={`scenario-${buildingTypeId}-button`}
                      icon={this.state.scenarioOptions.isOpen[buildingTypeId] ? "arrow-up" : "arrow-down"}
                      onClick={() => this.handleExpandClick(buildingTypeId)}>
                      <h4>{project.calcData.buildingTypes[buildingTypeId].name}</h4>
                    </Button>
                    <Collapse key={`scenario-${buildingTypeId}-collapse`} isOpen={this.state.scenarioOptions.isOpen[buildingTypeId]}>
                      {
                        // for each parameter category
                        Object.keys(this.state.scenarioOptions.paramCategories).map(paramCategoryName => {
                          const paramCategory = this.state.scenarioOptions.paramCategories[paramCategoryName as TScenarioParamCategory];
                          return paramCategory.global? (null) : (
                            <div key={`scenario-${buildingTypeId}-${paramCategoryName}-div`}>
                            <h3 key={`scenario-${buildingTypeId}-${paramCategoryName}-header`}>{paramCategory.label}</h3>
                            {
                              Object.keys(paramCategory.parameters).map(paramName => {
                                const param = paramCategory.parameters[paramName];
                                return (
                                  <div key={`scenario-${buildingTypeId}-${paramName}-div`} className="panel-list-row">
                                    <FormGroup
                                      inline
                                      className="inline-input"
                                      key={`scenario-${buildingTypeId}-${paramName}-input`}
                                      label={param.label}
                                      labelFor={`scenario-${buildingTypeId}-${paramName}-input`}>
                                      {
                                        Object.keys(scenarios).map(id => {
                                          param.path = `calcData.buildingTypes.${buildingTypeId}.scenarioInfos.${id}.${paramCategoryName}.${paramName}`;
                                          switch (param.mode) {
                                            case "input": {
                                              param.localPath = `${buildingTypeId}.scenarioInfos.${id}.${paramCategoryName}.${paramName}`;
                                              return renderInputField(`scenario-${buildingTypeId}-${paramName}-${id}`, param, buildingTypes, this.handleChange, param.validator)
                                            } case "dropdown": {
                                              const data = _fpGet(param.optionPath, this.state.project);
                                              const alts = Object.keys(data).map((key) => {
                                                const dataPoint = data[key];
                                                return {
                                                  label: dataPoint[param.nameKey] || "",
                                                  id: dataPoint.id || "",
                                                  name: dataPoint[param.nameKey] || "",
                                                  path: param.path || "",
                                                }
                                              });
                                              
                                              const selId = _fpGet(param.path, this.state.project);
                                              const selected = alts.find(e => {
                                                return e.id === selId;
                                              }) || {
                                                label: "Select...",
                                                path: "",
                                                id: "",
                                                name: "",
                                              };

                                              return renderDropdown(`scenario-${buildingTypeId}-${paramName}-${id}`, alts, selected, param, this.handleDropdownChange)
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
                            </div>
                          )
                        })
                      }
                    </Collapse>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}