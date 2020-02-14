import React from 'react';
import { IEnergySystemsCardProps } from "../../../types";
import { Button, FormGroup, InputGroup } from '@blueprintjs/core';

interface IEnergySystemParameter {
  type: StringConstructor | NumberConstructor;
  label: string;
}

export const EnergySystemsCard = (props: IEnergySystemsCardProps) => {

  const energySystemParameters: Record<string,IEnergySystemParameter> = {
    systemType: {
      type: String,
      label: "System type",
    }
  }

  const handleAddEnergySystemClick = (e: React.MouseEvent<HTMLElement>) => {
    props.addEnergySystem();
  }

  
  const energySystems = props.data;
  return (
    <div>
      <Button
        minimal
        className="bp3-button add-energy-system-button"
        icon="add"
        onClick={handleAddEnergySystemClick} />
      {
        Object.keys(energySystemParameters).map( (param: string) => {
          return (
            <FormGroup
              inline
              className="inline-input"
              key={`energy-system-${param}-input`}
              label={energySystemParameters[param].label}
              labelFor={`energy-system-${param}-input`}>
              {
                Object.keys(energySystems).map(id => {
                  if (!energySystems[id].hasOwnProperty(param)) {
                    throw Error(`Energy system ${id} does not have parameter ${param}`);
                  }
                  switch(energySystemParameters[param].type) {
                    case Number:
                      return (
                        //todo: we can't handle numeric inputs here yet!
                        <InputGroup
                          key={`energySystem-${id}-${param}-input`}
                          name={`energySystems.${id}.${param}`}
                          id={`energySystem-${id}-${param}-input`}
                          onChange={props.handleChange}
                          value={energySystems[id][param] as string} />
                      )
                    case String:
                      return (
                        <InputGroup
                          key={`energySystem-${id}-${param}-input`}
                          name={`energySystems.${id}.${param}`}
                          id={`energySystem-${id}-${param}-input`}
                          onChange={props.handleChange}
                          value={energySystems[id][param] as string} />
                      )
                    default:
                      throw Error(`this data type: ${energySystemParameters[param].type} has not been defined`);
                  }
                })
              }
            </FormGroup>
          )
        })
      }
    </div>
  )
}