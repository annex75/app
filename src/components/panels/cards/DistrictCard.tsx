// external
import React, { Component } from "react"
import { FormGroup, Callout } from "@blueprintjs/core";
import 'mapbox-gl/dist/mapbox-gl.css';

// bim-energy
import { default as Mapbox } from '@bimenergy/map';

// internal
import { IDistrictCardProps, IDistrictCardState, IDistrictParamCategory, IMapBoxState, IMapClickEvent, ICoord } from "../../../types";
import { renderInputField, renderInputLabel, } from '../../../helpers';

export class DistrictCard extends Component<IDistrictCardProps,IDistrictCardState> {
  constructor(props: IDistrictCardProps) {
    super(props);
    const paramCategories: Record<string,IDistrictParamCategory> = {
      general: {
        label: "General information",
        parameters: {
          country: {
            info: "Country where district is located",
            key: "country",
            type: String,
            label: "Country",
            localPath: "location.country.country",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          place: {
            info: "City, town or municipality where district is located",
            key: "place",
            type: String,
            label: "Location",
            localPath: "location.place",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          latitude: {
            info: "Set using right hand side map",
            disabled: true,
            key: "latitude",
            type: String,
            label: "Latitude",
            localPath: "location.lat",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          longitude: {
            info: "Set using right hand side map",
            disabled: true,
            key: "longitude",
            type: String,
            label: "Longitude",
            localPath: "location.lon",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          altitude: {
            info: "Above sea level",
            key: "altitude",
            type: String,
            label: "Altitude",
            unit: "meter",
            localPath: "location.altitude",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          climateZone: {
            info: "According to Köppen climate classification",
            key: "climateZone",
            type: String,
            label: "Climate zone",
            localPath: "climate.zone",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          designOutdoorTemperature: {
            //info: "Design temperature",
            key: "designOutdoorTemperature",
            type: String,
            unit: "degC",
            label: "Design temperature",
            localPath: "climate.designOutdoorTemperature",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          climateFile: {
            key: "climateFile",
            type: "file",
            label: "Climate file",
            buttonLabel: "Upload .epw file",
            disabled: true,
            path: "district.climate.filename",
            handleChange: this.props.handleChange,
          }
        }
      },
      districtEnergy: {
        label: "District energy system",
        parameters: {
          pipingLength: {
            key: "pipingLength",
            type: String,
            unit: "meter",
            label: "Required piping length",
            localPath: "geometry.pipingLength",
            info: "Pipes required between substations and buildings",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          distanceToDistrictHeatingNetwork: {
            key: "distanceToDistrictHeatingNetwork",
            type: String,
            unit: "meter",
            label: "Distance to DHN",
            info: "Pipes required between district heating network connection and substations",
            localPath: "geometry.distanceToDistrictHeatingNetwork",
            rootPath: "district",
            handleChange: this.props.handleChange,
          }
        },
      },
      renewables: {
        label: "Renewables",
        parameters: {
          availableSolarPanelArea: {
            key: "availableSolarPanelArea",
            type: String,
            unit: "meterSq",
            info: "Area available for photovoltaic panels on ground and buildings",
            label: "Available area for solar panels",
            localPath: "geometry.solarPanelArea",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          availableHeatSources: {
            key: "availableHeatSources",
            type: String,
            label: "Available heat sources/sinks",
            localPath: "energy.heatSources",
            rootPath: "district",
            handleChange: this.props.handleChange,
          },
          availableGSHP: {
            key: "availableGSHPArea",
            type: Number,
            unit: "meterSq",
            info: "Area available for ground source heat pumps",
            label: "Available area for GSHP",
            localPath: "energy.gshpArea",
            rootPath: "district",
            handleChange: this.props.handleChange,
          }
        },
      }
    };

    const mapBoxState: IMapBoxState = {
      zoom: 1,
      center: [0,0],
      markCenter: false,
      disableScroll: false,
    }

    this.state = { 
      paramCategories, 
      mapBoxState,
    };
  }

  renderInputField = (param: any, data: any) => {
    switch (param.type) {
      case "file":
        return (
          <Callout>
            {
              this.props.renderFileUploader()
            }
          </Callout>
        )
      default:
        return renderInputField("district", param, data);
    }
  }

  renderMap = (handleChange: void) => {
    return (
      <div className="map-container">
        <Mapbox
          disableScroll={this.state.mapBoxState.disableScroll}
          // eslint-disable-next-line
          style="streets"
          id="overview-map-input"
          zoom={this.state.mapBoxState.zoom}
          center={this.state.mapBoxState.center}
          markCenter={this.state.mapBoxState.markCenter}
          token="pk.eyJ1IjoiamFrZWJiIiwiYSI6ImNqZWg1bzg1aDIxbGEyd2t0ZmozdzZyaDIifQ._yufSSs01XE-16Bc1qosXQ" // where does this come from?
          onClick={this.onMapClick}
        />
      </div>
    )
  }

  // todo: unfortunate that we hardcode the path in this location
  onMapClick = (e: IMapClickEvent) => {
    const coord: ICoord = {
      lon: e.lngLat[0],
      lat: e.lngLat[1],
    }
    for (const key in coord) {
      this.props.handleChangePath(`project.calcData.district.location.${key}`, this.formatCoordinate(coord[key]));
    }
  }

  formatCoordinate = (value: number) => {
    return value.toFixed(2);
  }
  
  render() {
    const district = this.props.data;
    return (
      <div>
        {
          Object.keys(this.state.paramCategories).map(paramCategoryName => {
            const paramCategory = this.state.paramCategories[paramCategoryName];
            return (
              <div id={`overview-${paramCategoryName}-div`} key={`overview-${paramCategoryName}-div`}>
                <h4>{paramCategory.label}</h4>
                <div className="district-card-columns">
                  <div className="district-card-left-column">
                    {
                      Object.keys(paramCategory.parameters).map(paramName => {
                        const param = paramCategory.parameters[paramName];
                        return (
                          <FormGroup
                            inline
                            className="inline-input"
                            key={`overview-${param.key}-input`}
                            label={renderInputLabel(param)}
                            labelFor={`overview-${param.key}-input`}>
                            {
                              this.renderInputField(param, district)
                            }
                          </FormGroup>
                        )
                          
                      })
                    }
                  </div>
                  
                  {
                    paramCategoryName !== "general"
                      ? (null)
                      : (
                        <div className="district-card-right-column">
                          {
                            this.renderMap()
                          }
                        </div>
                      )
                    
                  }
                </div>
              </div>
            )
              
          })
        }
      </div>

    )

  }
}

