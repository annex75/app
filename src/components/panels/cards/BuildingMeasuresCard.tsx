import React, { Component } from 'react';
import { IBuildingMeasuresCardProps, IBuildingMeasuresCardState, IBuildingMeasureCategoryCard, IDictEventHandler, IDictBuildingMeasure, IBuildingMeasureInfo } from '../../../types';
import { Button, Collapse, FormGroup, InputGroup } from '@blueprintjs/core';

export class BuildingMeasuresCard extends Component<IBuildingMeasuresCardProps, IBuildingMeasuresCardState> {
  
  constructor(props: IBuildingMeasuresCardProps) {
    super(props);

    const buildingMeasureCategories: Record<string,IBuildingMeasureCategoryCard> = {
      // todo: it would be neat if a factory could produce these
      roof: {
        name: "roof",
        title: "Roof",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: {
          measureName: {
            type: String,
            label: "Measure name:",
            unit: "",
          },
          refurbishmentCost: {
            type: String,
            label: "Refurbishment cost:",
            unit: "euro",
          },
          uValue: {
            type: Number,
            label: "New U-value:",
            unit: "watt/m2K",
          },
        }
      },
      facade: {
        name: "facade",
        title: "Façade",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: {
          measureName: {
            type: String,
            label: "Measure name:",
            unit: "",
          },
          refurbishmentCost: {
            type: String,
            label: "Refurbishment cost:",
            unit: "euro",
          },
          uValue: {
            type: Number,
            label: "New U-value:",
            unit: "watt/m2K",
          },
        }
      },
      foundation: {
        name: "foundation",
        title: "Foundation",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: {
          measureName: {
            type: String,
            label: "Measure name:",
            unit: "",
          },
          refurbishmentCost: {
            type: String,
            label: "Refurbishment cost:",
            unit: "euro",
          },
          uValue: {
            type: Number,
            label: "New U-value:",
            unit: "watt/m2K",
          },
        }
      },
      windows: {
        name: "windows",
        title: "Windows",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: {
          measureName: {
            type: String,
            label: "Measure name:",
            unit: "",
          },
          refurbishmentCost: {
            type: String,
            label: "Refurbishment cost:",
            unit: "euro",
          },
          uValue: {
            type: Number,
            label: "New U-value:",
            unit: "watt/m2K",
          },
        }
      },
      hvac: {
        name: "hvac",
        title: "HVAC system",
        isOpen: false,
        eventHandlers: {
          handleChange: this.props.handleChange,
          handleAddBuildingMeasureClick: this.props.addBuildingMeasure,
        },
        parameters: {
          measureName: {
            type: String,
            label: "Measure name:",
            unit: "",
          },
          refurbishmentCost: {
            type: String,
            label: "Refurbishment cost:",
            unit: "euro",
          },
          efficiency: {
            type: Number,
            label: "New efficiency",
            unit: "percent",
          },
        }
      },
    };

    this.state = { buildingMeasureCategories };
  }

  handleExpandBuildingMeasuresCategoryClick = (e: React.MouseEvent<HTMLElement>, name: string) => {
    let newState = { ...this.state };
    newState.buildingMeasureCategories[name].isOpen = !newState.buildingMeasureCategories[name].isOpen;
    this.setState(newState);
  }

  render() {
    const buildingMeasures = this.props.data;
    return (
      <div>
        {
          Object.keys(this.state.buildingMeasureCategories).map(id => {
            const card = this.state.buildingMeasureCategories[id];
            const data = buildingMeasures[id];
            return (
              <div className="building-advanced-options-wrapper" key={`${id}-div`}>
                <Button
                  minimal
                  className="bp3-button"
                  name={card.name}
                  icon={card.isOpen ? "arrow-up" : "arrow-down"}
                  onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandBuildingMeasuresCategoryClick(e, id)}>
                  <h4>{card.title}</h4>
                </Button>
                <BuildingMeasureCategoryCard key={id} isOpen={card.isOpen} data={data} eventHandlers={card.eventHandlers} category={id} parameters={card.parameters} />
              </div>
            )
          })
        }
      </div>
    )
  }
}

interface IBuildingMeasureCategoryCardProps {
  isOpen: boolean;
  data: IDictBuildingMeasure;
  eventHandlers: IDictEventHandler;
  category: string;
  parameters: Record<string,IBuildingMeasureInfo>;
}

const BuildingMeasureCategoryCard = (props: IBuildingMeasureCategoryCardProps) => {
  const buildingMeasures = props.data;
  const category = props.category;
  return (
    <div>
      <Collapse key={`${category}-collapse`} isOpen={props.isOpen}>
        {
          Object.keys(props.parameters).map( (param: string, i: number) => {
            return (
              <FormGroup
                inline
                className="inline-input"
                key={`building-${param}-input`}
                label={props.parameters[param].label}
                labelFor={`building-${param}-input`}>
                {
                  Object.keys(buildingMeasures).map(id => {
                    const c = buildingMeasures[id];
                    if (!c.hasOwnProperty(param)) {
                      throw Error(`Building measure ${id} does not have parameter ${param}`);
                    }
                    switch(props.parameters[param].type) {
                      case Number:
                        return (
                          //todo: we can't handle numeric inputs here yet!
                          <InputGroup
                            key={`building-measure-${id}-${category}-${param}-input`}
                            name={`buildings.${id}.${category}.${param}`}
                            id={`building-measure-${id}-${param}-input`}
                            onChange={props.eventHandlers.handleChange}
                            value={c[param] as string} />
                        )
                      case String:
                        return (
                          <InputGroup
                            key={`building-measure-${id}-${category}-${param}-input`}
                            name={`buildingMeasures.${category}.${id}.${param}`}
                            id={`building-measure-${id}-${param}-input`}
                            onChange={props.eventHandlers.handleChange}
                            value={c[param] as string} />
                        )
                      default:
                        throw Error(`this data type: ${props.parameters[param].type} has not been defined`);
                    }
                  })              
                }
                {
                  !i?  // only have an add button on the first row (i == 0)
                  <Button
                    minimal
                    className="bp3-button add-energy-system-button"
                    icon="add"
                    onClick={(e: React.MouseEvent<HTMLElement>) => props.eventHandlers.handleAddBuildingMeasureClick(category)} />
                  : <span className="empty-button"/>
                }
              </FormGroup>
            )
            
          })
        }
      </Collapse>
    </div>
  )
}
