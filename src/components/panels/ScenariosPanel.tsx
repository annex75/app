import React, { Component, ChangeEvent } from 'react';
import { set as _fpSet } from 'lodash/fp';

import * as config from '../../config.json';
import { IScenariosPanelProps, IScenariosPanelState, Scenario, IScenarioOptionsCard, ScenarioInfo, TScenarioParamCategory } from '../../types';
import { InputGroup, FormGroup, Button, Intent, Collapse } from '@blueprintjs/core';
import { AppToaster } from '../../toaster';

export class ScenariosPanel extends Component<IScenariosPanelProps, IScenariosPanelState> {
  constructor(props: IScenariosPanelProps) {
    super(props);
    const project = props.project;
    const isOpen: Record<string,boolean> = {}
    for (const id of Object.keys(project.calcData.buildings)) {
      isOpen[id] = false;
    }
    const scenarioOptions: IScenarioOptionsCard = {
      eventHandlers: { handleChange: this.handleChange },
      isOpen: isOpen,
      parameters: {
        building: {
          numberOfBuildings: {
            type: Number,
            label: "Number of buildings:",
          }
        },
        energySystem: {
          energySystem: {
            type: String,
            label: "Energy system:",
          }
        },
        buildingMeasures: {
          roof: {
            type: String,
            label: "Roof:",
          },
          facade: {
            type: String,
            label: "Facade:",
          },
          foundation: {
            type: String,
            label: "Foundation:"
          },
          windows: {
            type: String,
            label: "Windows:",
          },
          hvac: {
            type: String,
            label: "HVAC system:"
          }
        },
      },
      labels: {
        building: "Building options",
        energySystem: "Energy system options",
        buildingMeasures: "Building renovation measures",
      },
    }

    this.state = {
      project,
      scenarioOptions,
    }
  }

  componentDidUpdate(prevProps: IScenariosPanelProps) {
    if (this.props.project !== prevProps.project) {
      this.setState({ project: this.props.project });
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const path = this.formatPath(e.target.name);
    const newState = _fpSet(path, e.target.value, this.state);
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  // takes a subpath and returns its location in the main data structure
  formatPath = (childPath: string) => {
    return `project.${childPath}`;
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
    for (const buildingId in newState.project.calcData.buildings) {
      let building = newState.project.calcData.buildings[buildingId];
      building.scenarioInfos[scenario.id] = new ScenarioInfo();
    } 
    
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  handleExpandClick = (buildingId: string) => {
    let newState = { ...this.state };
    newState.scenarioOptions.isOpen[buildingId] = !newState.scenarioOptions.isOpen[buildingId];

    this.setState(newState);
  }

  render() {
    const project = this.state.project;
    const scenarios = project.scenarioData.scenarios;
    const buildings = project.calcData.buildings;
    return (
      <div>
        <h1>{this.props.title}</h1>
        <div id="scenarios-card" className="bp3-card panel-card">
          <div className="panel-list-header">
            {
              <FormGroup
                inline
                className="inline-input"
                key={`building-name-input`}
                label="Scenario name:"
                labelFor="building-name-input">
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
              className="bp3-button add-building-button"
              icon="add"
              onClick={this.handleAddScenarioClick} />
          </div>
          {
            // for each building
            Object.keys(buildings).map((buildingId: string) => {
              return (
                <div key={`scenario-${buildingId}-div`} style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
                  <Button
                    minimal
                    className="bp3-button"
                    icon={this.state.scenarioOptions.isOpen[buildingId] ? "arrow-up" : "arrow-down"}
                    onClick={() => this.handleExpandClick(buildingId)}>
                    {project.calcData.buildings[buildingId].name}
                  </Button>
                  <Collapse key={`scenario-${buildingId}-collapse`} isOpen={this.state.scenarioOptions.isOpen[buildingId]}>
                    {
                      // for each parameter category
                      Object.keys(this.state.scenarioOptions.parameters).map(paramCategoryName => {
                        const paramCategory = this.state.scenarioOptions.parameters[paramCategoryName as TScenarioParamCategory];
                        return (
                          <div key={`scenario-${buildingId}-${paramCategoryName}-div`}>
                          <h3>{this.state.scenarioOptions.labels[paramCategoryName]}</h3>
                          {
                            Object.keys(paramCategory).map(paramName => {
                              const param = paramCategory[paramName];
                              return (
                                <div key={`scenario-${buildingId}-${paramName}-div`} className="panel-list-row">
                                  <FormGroup
                                    inline
                                    className="inline-input"
                                    key={`scenario-${buildingId}-${paramName}-input`}
                                    label={param.label}
                                    labelFor={`scenario-${buildingId}-${paramName}-input`}>
                                    {
                                      Object.keys(scenarios).map(scenarioId => {
                                        //const b = ;
                                        const c = buildings[buildingId].scenarioInfos[scenarioId][paramCategoryName] as any;
                                        if (!c.hasOwnProperty(paramName)) {
                                          throw Error(`Scenario ${scenarioId} does not have parameter ${paramName}`);
                                        }
                                        switch(param.type) {
                                          case Number:
                                            return (
                                              //todo: we can't handle numeric inputs here yet!
                                              <InputGroup
                                                key={`scenario-${scenarioId}-${buildingId}-${paramCategoryName}-${paramName}-input`}
                                                name={`calcData.buildings.${buildingId}.scenarioInfos.${scenarioId}.${paramCategoryName}.${paramName}`}
                                                id={`scenario-${scenarioId}-${buildingId}-${paramCategoryName}-${paramName}-input`}
                                                onChange={this.handleChange}
                                                value={c[paramName] as string} />
                                            )
                                          case String:
                                            return (
                                              <InputGroup
                                                key={`scenario-${scenarioId}-${buildingId}-${paramCategoryName}-${paramName}-input`}
                                                name={`calcData.buildings.${buildingId}.scenarioInfos.${scenarioId}.${paramCategoryName}.${paramName}`}
                                                id={`scenario-${scenarioId}-${buildingId}-${paramCategoryName}-${paramName}-input`}
                                                onChange={this.handleChange}
                                                value={c[paramName] as string} />
                                            )
                                          default:
                                            throw Error(`this data type: ${param.type} has not been defined`);
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
                        /* const data = buildings; // todo: not great that we pass all the buildings data in
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
                        )*/
                      })
                    }
                  </Collapse>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}