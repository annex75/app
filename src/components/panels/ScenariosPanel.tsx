// external
import React, { Component, ChangeEvent } from 'react';
import { set as _fpSet, get as _fpGet, equals as _fpEquals } from 'lodash/fp';
import { cloneDeep as _cloneDeep, pickBy as _pickBy, debounce as _debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { InputGroup, FormGroup, Button, Intent, Collapse, Position, Tooltip, Alert } from '@blueprintjs/core';

// internal
import * as config from '../../config.json';
import { IScenariosPanelProps, IScenariosPanelState, Scenario, IScenarioOptionsCard, ScenarioInfo, TScenarioParamCategory, IScenarioInput, IDictBool, } from '../../types';
import { AppToaster } from '../../toaster';
import { renderInputField, renderDropdown, IDropdownAlt, renderInputLabel, InfoButton } from '../../helpers';
import { documentation } from '../../constants/textData';

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
          info: documentation.buildingTypeScenario,
          global: false,
          parameters: {
            numberOfBuildings: {
              key: "numberOfBuildings",
              type: Number,
              unit: "none",
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Number of buildings",
            },
            heatingNeed: {
              key: "heatingNeed",
              type: Number,
              mode: "input",
              info: "Heating need per building. This is the calculated heating need after renovation measures have been applied.",
              unit: "kiloWattHourPerYear",
              label: "Heating need",
              rootPath: "scenarioData.scenarios",
            },
            occupancy: {
              key: "occupancy",
              info: "Building use, e.g. housing, office, public, etc.",
              type: String,
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Building use"
            },
            occupants: {
              key: "occupants",
              type: Number,
              mode: "input",
              unit: "meterSqPerPerson",
              rootPath: "scenarioData.scenarios",
              label: "Area per occupant",
            },
            /*
            setPointTemp: {
              key: "setPointTemp",
              type: Number,
              mode: "input",
              unit: "degC",
              rootPath: "scenarioData.scenarios",
              label: "Set point temperature (heating)",
            },
            */
            appliancesElectricityUsage: {
              key: "appliancesElectricityUsage",
              type: Number,
              mode: "input",
              info: "For reference only.",
              unit: "kiloWattHourPerMeterSqYear",
              rootPath: "scenarioData.scenarios",
              label: "Domestic electricity usage",
            },
            domesticHotWaterUsage: {
              key: "domesticHotWaterUsage",
              type: Number,
              mode: "input",
              info: "For reference only.",
              unit: "kiloWattHourPerMeterSqYear",
              rootPath: "scenarioData.scenarios",
              label: "Domestic hot water usage",
            },

          }
        },
        economy: {
          label: "Economic parameters",
          info: documentation.economyScenario,
          global: true,
          parameters: {
            interestRate: {
              key: "interestRate",
              type: Number,
              unit: "percent",
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Real interest rate",
            },
            /*energyPriceIncrease: {
              key: "energyPriceIncrease",
              type: Number,
              mode: "input",
              rootPath: "scenarioData.scenarios",
              label: "Annual energy price increase",
            },*/
            /*
            calculationPeriod: {
              key: "calculationPeriod",
              type: Number,
              mode: "input",
              unit: "years",
              rootPath: "scenarioData.scenarios",
              label: "Calculation period"
            },
            */
          }
        },
        energySystem: {
          label: "Energy system options",
          info: documentation.energySystemScenario,
          global: false,
          parameters: {
            energySystem: {
              key: "energySystem",
              nameKey: "name",
              optionPath: "calcData.energySystems",
              mode: "dropdownOptionPath",
              label: "Energy system",
            },
          },
        },
        buildingMeasures: {
          label: "Building renovation measures",
          info: documentation.buildingMeasuresScenario,
          global: false,
          parameters: {
            facade: {
              key: "facade",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.insulation",
              subPath: "facade.id",
              mode: "dropdownOptionPath",
              label: "Façade",
            },
            facadeInsulationThickness: {
              key: "facadeInsulationThickness",
              type: Number,
              unit: "centimeter",
              rootPath: "scenarioData.scenarios",
              subPath: "facade.thickness",
              mode: "input",
              label: "Thickness of façade insulation",
            },
            roof: {
              key: "roof",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.insulation",
              subPath: "roof.id",
              mode: "dropdownOptionPath",
              label: "Roof",
            },
            roofInsulationThickness: {
              key: "roofInsulationThickness",
              type: Number,
              unit: "centimeter",
              rootPath: "scenarioData.scenarios",
              subPath: "roof.thickness",
              mode: "input",
              label: "Thickness of roof insulation",
            },
            foundation: {
              key: "foundation",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.insulation",
              subPath: "foundation.id",
              mode: "dropdownOptionPath",
              label: "Foundation",
            },
            foundationWallInsulationThickness: {
              key: "foundationWallInsulationThickness",
              type: Number,
              unit: "centimeter",
              rootPath: "scenarioData.scenarios",
              subPath: "foundation.wallThickness",
              mode: "input",
              label: "Thickness of cellar wall insulation",
            },
            foundationFloorInsulationThickness: {
              key: "foundationFloorInsulationThickness",
              type: Number,
              unit: "centimeter",
              rootPath: "scenarioData.scenarios",
              subPath: "foundation.floorThickness",
              mode: "input",
              label: "Thickness of cellar floor insulation",
            },
            windows: {
              key: "windows",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.windows",
              subPath: "windows.id",
              mode: "dropdownOptionPath",
              label: "Windows",
            },
            hvac: {
              key: "hvac",
              nameKey: "measureName",
              optionPath: "calcData.buildingMeasures.hvac",
              subPath: "hvac.id",
              mode: "dropdownOptionPath",
              label: "HVAC system",
            }
          }
        },
      },
    }

    let deleteWarningOpen: IDictBool = {};
    Object.keys(props.project.scenarioData.scenarios).forEach((id: string) => {
      deleteWarningOpen[id] = false;
    });

    this.state = {
      project,
      scenarioOptions,
      deleteWarningOpen,
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
      this.updateProjectDebounce();
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
    this.setStateAndUpdate(newState);
  }

  handleAddScenarioClick = (e: React.MouseEvent<HTMLElement>) => {
    this.addScenario();
  }

  setStateAndUpdate = (newState: IScenariosPanelState) => {
    this.setState(newState);
    this.updateProjectDebounce();
  }

  performDatabaseOperation = (checkValidOperation: (newState: IScenariosPanelState) => boolean, operation: (newState: IScenariosPanelState) => void) => {
    let newState = { ...this.state };
    if (!checkValidOperation(newState)) return;
    operation(newState); // we allow this operation to mutate the newState object
    this.setStateAndUpdate(newState);
  }

  addScenario = (id: string = "") => {
    const valid = (newState: IScenariosPanelState) => {
      if (Object.keys(newState.project.scenarioData.scenarios).length >= config.MAX_SCENARIOS) {
        AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_SCENARIOS} scenarios are currently allowed`});
        return false;
      }
      return true;
    }
    const operation = (newState: IScenariosPanelState) => {
      let scenario;
      if (id) {
        const scenarioOriginal = newState.project.scenarioData.scenarios[id];
        if (!scenarioOriginal) {
          throw new Error(`Scenario ${id} could not be found`);
        } 
        const copyName = `${scenarioOriginal.name} - copy`;
        scenario = _cloneDeep(scenarioOriginal);
        scenario.id = uuidv4();
        scenario.name = copyName;
      } else {
        scenario = new Scenario();
        for (const buildingTypeId in newState.project.calcData.buildingTypes) {
          scenario.buildingTypes[buildingTypeId] = new ScenarioInfo();
        } 
      }
      newState.project.scenarioData.scenarios[scenario.id] = scenario;
    }
    this.performDatabaseOperation(valid, operation);
  }

  handleExpandClick = (buildingId: string) => {
    let newState = { ...this.state };
    newState.scenarioOptions.isOpen[buildingId] = !newState.scenarioOptions.isOpen[buildingId];

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

  handleAlertConfirm = (id: string) => {
    let newState = { ...this.state };
    newState.deleteWarningOpen[id] = false;
    this.setState(newState);
    this.deleteScenario(id);
  }

  // todo: actually delete it from the database (similar to deleting projects)
  deleteScenario = (id: string) => {
    const valid = (newState: IScenariosPanelState) => {
      if (Object.keys(newState.project.scenarioData.scenarios).filter(id => !newState.project.scenarioData.scenarios[id].deleted).length <= 1) {
        AppToaster.show({ intent: Intent.DANGER, message: `The last scenario can not be deleted.`});
        return false;
      }
      return true;
    }
    const operation = (newState: IScenariosPanelState) => {
      const scenario = newState.project.scenarioData.scenarios[id];
      if (!scenario) {
        throw new Error(`Scenario ${id} could not be found`);
      }
      newState.project.scenarioData.scenarios[id].deleted = true;
    }
    this.performDatabaseOperation(valid, operation);
  }

  copyScenario = (id: string) => this.addScenario(id);

  createValidator = (path: string, name: string, key: string) => {
    return (val: string) => {
      const obj = _fpGet(path, this.state);
      return {
        valid: Object.keys(_pickBy(obj, (e) => { return e[key] === val })).length === 1,
        invalidMsg: `No unique ${name} with the name ${val} could be found in the project`,
      }
    }
  }

  panelInfo = documentation.scenariosPanel;
  
  getInfoText = () => {
    return `# ${this.props.title}\n\n${this.panelInfo}\n\n${Object.keys(this.state.scenarioOptions.paramCategories).map(catId => {
      const category = this.state.scenarioOptions.paramCategories[catId as TScenarioParamCategory];
      return `## ${category.label}\n\n${category.info??""}\n\n`
    }).join('')}`;
  }

  render() {
    const project = this.state.project;
    const scenarios = project.scenarioData.scenarios;
    const buildingTypes = project.calcData.buildingTypes;
    return (
      <div>
        <InfoButton level={1} label={this.props.title} info={this.getInfoText()}/>
        <div id="scenarios-card" className="bp3-card panel-card">
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
                  Object.keys(scenarios).filter(id => !scenarios[id].deleted).map(id => {
                    return (
                      <div key={`scenarios-button-header-${id}`} className="building-type-button-header-div">
                        <Tooltip content={`Copy Scenario "${scenarios[id].name}"`} position={Position.TOP}>
                          <Button onClick={() => this.copyScenario(id)} className="bp3-minimal building-type-header-button bp3-icon-duplicate"></Button>
                        </Tooltip>
                        <Alert
                          cancelButtonText="Cancel"
                          confirmButtonText="Delete Scenario"
                          intent={Intent.DANGER}
                          isOpen={this.state.deleteWarningOpen[id]}
                          onCancel={() => this.handleAlertCancel(id)}
                          onConfirm={() => this.handleAlertConfirm(id)}>
                          <p>
                            Are you sure you want to delete this Scenario? This action is irreversible!
                          </p>
                        </Alert>
                        <Tooltip intent={Intent.WARNING} content={`Delete scenario "${scenarios[id].name}"`} position={Position.TOP}>
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
                    Object.keys(scenarios).filter(id => !scenarios[id].deleted).map(id => {
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
                              label={renderInputLabel(param)}
                              labelFor={`scenario-global-${paramName}-input`}>
                              {
                                Object.keys(scenarios).filter(id => !scenarios[id].deleted).map(id => {
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
                                      label={renderInputLabel(param)}
                                      labelFor={`scenario-${buildingTypeId}-${paramName}-input`}>
                                      {
                                        Object.keys(scenarios).filter(id => !scenarios[id].deleted).map(id => {
                                          param.path = `scenarioData.scenarios.${id}.buildingTypes.${buildingTypeId}.${paramCategoryName}.${param.subPath || paramName}`;
                                          switch (param.mode) {
                                            case "input": {
                                              param.localPath = `${id}.buildingTypes.${buildingTypeId}.${paramCategoryName}.${param.subPath || paramName}`;
                                              return renderInputField(`scenario-${buildingTypeId}-${paramName}-${id}`, param, scenarios, this.handleChange, param.validator)
                                            } case "dropdownOptionPath": {
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

                                              return renderDropdown(`scenario-${buildingTypeId}-${paramName}-${id}`, alts, selected, this.handleDropdownChange)
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