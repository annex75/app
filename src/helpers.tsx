// external
import React, { ChangeEvent } from 'react'
import { InputGroup, Intent } from "@blueprintjs/core";
import { get as _fpGet } from 'lodash/fp';

// internal
import { IInput, IValidatorResult } from './types';

export const renderInputField = (parent: string, param: IInput, obj: any, handleChange?: (e: ChangeEvent<HTMLInputElement>) => void, validator?: (val: string) => IValidatorResult ) => {
  const val = _fpGet(param.localPath || param.path!, obj) as string;

  const valid = !validator? { valid: true, invalidMsg: "" } : validator(val);

  const path = param.rootPath && param.localPath? `${param.rootPath}.${param.localPath}`: param.path;
  switch(param.type) {
    case Number:
      //todo: we can't handle numeric inputs here yet!
      // return (
      //<NumericInput 
      //    name="project.overviewData.location.lat"
      //    id="lat-input"
      //    min={-90}
      //    max={90}
      //    onValueChange={ (n, s, e) => { this.handleChange(e) }}
      //    value={project.calcData.district.location.lat}/>
      //)
      // falls through
    case String: 
      return (
        <div className="validated-input-group" key={`${parent}-${param.key}-container-div`} >
          <InputGroup
            disabled={param.disabled || false}
            key={`${parent}-${param.key}-input`}
            name={path}
            id={`${parent}-${param.key}-input`}
            onChange={param.handleChange || handleChange}
            value={val} 
            intent={valid.valid? Intent.NONE : Intent.WARNING}/>
        { valid.valid? null: <div className="invalid-input-warning" key={`${parent}-${param.key}-msg-div`}>{valid.invalidMsg || "Invalid value."}</div> }
      </div>
    )
    default:
      throw Error(`this data type: ${param.type} cannot be rendered by this helper function`);
  }
}

export const secureLink = (href: string, text: string, target: string = "_blank") => {
  return <a href={href} target={target} rel="noopener noreferrer">{text}</a>;
}