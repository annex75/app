import React, { Component } from "react"
import { FormGroup } from "@blueprintjs/core";

import { IDistrictCardProps, IDistrictCardState, IDistrictParamCategory } from "../../../types";
import { renderInputField, } from '../../../helpers';

// using fully controlled (stateless) components for now (hopefully this won't break when we add functionality)
// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
// this component will need state; refactor similar to BuildingCard later
export class DistrictCard extends Component<IDistrictCardProps,IDistrictCardState> {
  constructor(props: IDistrictCardProps) {
    super(props);
    const paramCategories: Record<string,IDistrictParamCategory> = {
      general: {
        label: "General information",
        parameters: {
          country: {
            key: "country",
            type: String,
            label: "Country:",
            localPath: "location.country.country",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          place: {
            key: "place",
            type: String,
            label: "City:",
            localPath: "location.place",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          latitude: {
            key: "latitude",
            type: String,
            label: "Latitude:",
            localPath: "location.lat",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          longitude: {
            key: "longitude",
            type: String,
            label: "Longitude:",
            localPath: "location.lon",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          climateZone: {
            key: "climateZone",
            type: String,
            label: "Climate zone:",
            localPath: "climate.zone",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          climateFile: {
            key: "climateFile",
            type: "file",
            label: "Climate file:",
            buttonLabel: "Upload .epw file",
            disabled: true,
            path: "district.climate.filename",
            handleChange: this.props.handleFileInput,
          }
        }
      },
      districtEnergy: {
        label: "District energy system",
        parameters: {
          pipingLength: {
            key: "pipingLength",
            type: String,
            label: "Required piping length:",
            localPath: "geometry.pipingLength",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          distanceToDistrictHeatingNetwork: {
            key: "distanceToDistrictHeatingNetwork",
            type: String,
            label: "Distance to distr. heating network:",
            localPath: "geometry.distanceToDistrictHeatingNetwork",
            rootPath: "district",
            handleChange: this.props.handleChange,
          }
        },
      },
      /* done in scenarios
      economy: {
        label: "Economic assumptions",
        parameters: {
          interestRate: {
            key: "interestRate",
            type: String,
            label: "Interest rate:",
            localPath: "economy.interestRate",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          energyPriceIncrease: {
            key: "energyPriceIncrease",
            type: String,
            label: "Energy price increase:",
            localPath: "economy.energyPriceIncrease",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          calculationPeriod: {
            key: "calculationPeriod",
            type: String,
            label: "Calculation period:",
            localPath: "economy.energyPriceIncrease",
            rootPath: "district",
            handleChange: this.props.handleChange,
          }
        },
      }, */
      renewables: {
        label: "Renewables",
        parameters: {
          availableSolarPanelArea: {
            key: "availableSolarPanelArea",
            type: String,
            label: "Available area for solar panels:",
            localPath: "geometry.solarPanelArea",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          availableHeatSources: {
            key: "availableHeatSources",
            type: String,
            label: "Available heat sources/sinks:",
            localPath: "energy.heatSources",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          availableGSHP: {
            key: "availableGSHPArea",
            type: Number,
            label: "Area for ground source heat pumps",
            localPath: "energy.gshpArea",
            rootPath: "district",
            handleChange: this.props.handleChange,
          }
        },
      }
    };
    this.state = { paramCategories };
  }
  
  render() {
    const district = this.props.data;
    return (
      <div>
        {
          Object.keys(this.state.paramCategories).map(paramCategoryName => {
            const paramCategory = this.state.paramCategories[paramCategoryName];
            return (
              <div>
                <h4>{paramCategory.label}</h4>
                {
                  Object.keys(paramCategory.parameters).map(paramName => {
                    const param = paramCategory.parameters[paramName];
                    return (
                      <FormGroup
                        inline
                        className="inline-input"
                        key={`overview-${paramName}-input`}
                        label={param.label}
                        labelFor={`overview-${paramName}-input`}>
                        {
                          renderInputField("district", param, district)
                        }
                      </FormGroup>
                    )
                  })
                }
              </div>
            )
              
          })
        }
      </div>

    )

  }
}