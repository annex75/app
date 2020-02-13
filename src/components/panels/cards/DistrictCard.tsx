import React from "react"
import { FormGroup, InputGroup, FileInput } from "@blueprintjs/core";
import { IDistrictCardProps } from "../../../types";

// using fully controlled (stateless) components for now (hopefully this won't break when we add functionality)
// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
// this component will need state; refactor similar to BuildingCard later
export const DistrictCard = (props: IDistrictCardProps) => {
  const district = props.data;
  return (
    <div>
      <FormGroup
        inline
        label="Country:"
        labelFor="country-input">
        <InputGroup
          name="district.location.country.country"
          id="country-input"
          onChange={props.handleChange}
          value={district.location.country.country} />
      </FormGroup>
      <FormGroup
        inline
        label="City:"
        labelFor="city-input">
        <InputGroup
          name="district.location.place"
          id="city-input"
          onChange={props.handleChange}
          value={district.location.place} />
      </FormGroup>
      <FormGroup
        inline
        label="Latitude:"
        labelFor="lat-input">
        <input
          className="bp3-input"
          name="district.location.lat"
          id="lat-input"
          min={-90}
          max={90}
          type="number"
          onChange={props.handleChange}
          value={district.location.lat} />
        {/* Annoying that we can't use this, but it does not expose onChange
                <NumericInput 
                    name="project.overviewData.location.lat"
                    id="lat-input"
                    min={-90}
                    max={90}
                    onInput={this.handleInput}
                    value={project.overviewData.location.lat}/>
                */}
      </FormGroup>
      <FormGroup
        inline
        label="Longitude:"
        labelFor="lon-input">
        <input
          className="bp3-input"
          name="district.location.lon"
          id="lon-input"
          min={-90}
          max={90}
          type="number"
          onChange={props.handleChange}
          value={district.location.lon} />
      </FormGroup>
      <FormGroup
        inline
        label="Climate zone:"
        labelFor="climate-zone-input">
        <InputGroup
          name="district.climate.zone"
          id="climate-zone-input"
          onChange={props.handleChange}
          value={district.climate.zone} />
      </FormGroup>
      <FormGroup
        inline
        label="Climate file:"
        labelFor="climate-file-input">
        <FileInput disabled
          id="climate-file-input"
          text="Upload .epw file"
          onInputChange={props.handleFileInput} />
      </FormGroup>
    </div>
  )
}