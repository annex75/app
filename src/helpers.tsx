// external
import React, { ChangeEvent } from 'react'
import { InputGroup } from "@blueprintjs/core";
import { get as _fpGet } from 'lodash/fp';

// internal
import { IInput } from './types';

export const renderInputField = (parent: string, param: IInput, obj: any, handleChange?: (e: ChangeEvent<HTMLInputElement>) => void ) => {
  const val = _fpGet(param.localPath || param.path!, obj) as string;
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
        <InputGroup
          disabled={param.disabled || false}
          key={`${parent}-${param.key}-input`}
          name={path}
          id={`${parent}-${param.key}-input`}
          onChange={param.handleChange || handleChange}
          value={val} />
      )
    default:
      throw Error(`this data type: ${param.type} cannot be rendered by this helper function`);
  }
}