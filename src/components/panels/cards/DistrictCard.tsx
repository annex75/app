// external
import React, { Component } from "react"
import { FormGroup } from "@blueprintjs/core";
import 'mapbox-gl/dist/mapbox-gl.css';
// @ts-ignore
import FileUploader from "react-firebase-file-uploader";
import firebase from "firebase";

// bim-energy
import { default as Mapbox } from '@bimenergy/map';

// internal
import { IDistrictCardProps, IDistrictCardState, IDistrictParamCategory, IMapBoxState, IMapClickEvent } from "../../../types";
import { renderInputField, } from '../../../helpers';

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

    const mapBoxState: IMapBoxState = {
      zoom: 1,
      center: [0,0],
      markCenter: false,
      disableScroll: false,
    }

    this.state = { paramCategories, mapBoxState };
  }

  renderInputField = (param: any, data: any) => {
    switch (param.type) {
      case "file":
        return this.renderFileUploader();
      default:
        return renderInputField("district", param, data);
    }
  }

  renderFileUploader = () => {
    return (
      <FileUploader
        accept="image/*"
        name="image-uploader-multiple"
        randomizeFilename
        storageRef={firebase.storage().ref("images")}
        onUploadStart={this.handleUploadStart}
        onUploadError={this.handleUploadError}
        onUploadSuccess={this.handleUploadSuccess}
        onProgress={this.handleProgress}
        multiple
      />
    )
  }

  handleUploadStart = (e: any) => {

  }

  handleUploadError = (e: any) => {
    
  }

  handleUploadSuccess = (e: any) => {
    
  }

  handleProgress = (e: any) => {
    
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
    const [ lon, lat ] = e.lngLat;
    this.props.handleChangePath("project.calcData.district.location.lon", lon);
    this.props.handleChangePath("project.calcData.district.location.lat", lat);
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
                            label={param.label}
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

