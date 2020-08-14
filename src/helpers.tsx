// external
import React, { ChangeEvent } from 'react'
import { MenuItem, InputGroup, Intent, Button } from "@blueprintjs/core";
import { Select, ItemRenderer } from '@blueprintjs/select';
import { get as _fpGet } from 'lodash/fp';

// internal
import { IInput, IValidatorResult, IDropdown } from './types';
import { ScatterChart, CartesianGrid, XAxis, YAxis, Scatter, ZAxis, Tooltip, Legend } from 'recharts';
import { Label } from 'recharts';

export const renderInputField = (parent: string, param: IInput, obj: any, handleChange?: (e: ChangeEvent<HTMLInputElement>) => void, validator?: (val: string) => IValidatorResult ) => {
  const val = _fpGet(param.localPath || param.path!, obj) as string || '';

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

export interface IDropdownAlt {
  label: string;
  name: string;
  id: string;
  path: string;
}

export const renderDropdown = (key: string, items: IDropdownAlt[], selected: IDropdownAlt, param: IDropdown, handleSelect: (item: IDropdownAlt) => void) => {
  const TheSelect = Select.ofType<IDropdownAlt>();
  const renderDropdownAlts: ItemRenderer<IDropdownAlt> = (item, { handleClick, modifiers }) => {
    return ( 
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        label={item.label}
        key={item.name}
        onClick={handleClick}
      />
    )
  }
  return (
    <TheSelect
      key={`${key}-select`}
      items={items}
      resetOnQuery={false}
      filterable={false}
      itemRenderer={renderDropdownAlts}
      onItemSelect={handleSelect}>
      <Button
        className="dropdown-button"
        id="cost-curve-type-button"
        rightIcon="caret-down"
        text={selected.label}
      />
    </TheSelect>
  )
}

export const secureLink = (href: string, text: string, target: string = "_blank") => {
  return <a href={href} target={target} rel="noopener noreferrer">{text}</a>;
}

export interface IScatterDataset {
  fillColor?: string;
  name: string;
  data: I3DData[];
}

export interface I3DData {
  x: number;
  y: number;
  z?: number;
}

interface IChartSettings {
  width: number;
  height: number;
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number,
  };
}

export interface IChartSetup {
  xUnit: string;
  xLabel: string;
  xRange?: [number, number];
  xKey: string;
  yUnit: string;
  yLabel: string;
  yRange?: [number, number];
  yKey: string;
  mode: "2d" | "3d";
  zUnit?: string;
  zLabel?: string;
  zRange?: [number, number];
  zKey?: string;
  name: string;
  legend?: boolean;
  label?: boolean
}

const defChartSetup: IChartSetup = {
  xUnit: "",
  xLabel: "x",
  xKey: "x",
  yUnit: "",
  yLabel: "y",
  yKey: "y",
  mode: "2d",
  name: "Scatter chart",
  legend: true,
  label: false,
}

const defChartSettings: IChartSettings = {
    width: 600,
    height: 400,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  }

export const renderScatterChart = (data: IScatterDataset[], chartSetup: IChartSetup = defChartSetup, chartSettings: IChartSettings = defChartSettings,  ) => {
  return (
    <ScatterChart {...chartSettings}>
      <CartesianGrid />
      <XAxis type="number" dataKey={chartSetup.xKey} domain={chartSetup.xRange} name={chartSetup.xLabel} unit={chartSetup.xUnit}>
        {
          chartSetup.label? <Label value={chartSetup.xLabel} offset={-15} position="insideBottom"/> : null
        }
      </XAxis>
      
      <YAxis type="number" dataKey={chartSetup.yKey} domain={chartSetup.yRange} name={chartSetup.yLabel} unit={chartSetup.yUnit}>
        {
          chartSetup.label? <Label className="chart-y-axis-label" value={chartSetup.yLabel} offset={-15} angle={-90} position="insideLeft"/> : null
        }
      </YAxis>
      
      {
        chartSetup.mode === "3d"? (<>
          <ZAxis type="number" dataKey={chartSetup.zKey} range={chartSetup.zRange} name={chartSetup.zLabel} unit={chartSetup.zUnit || '-'} />
        </>) : null
      }
      <Tooltip />
      {
        chartSetup.legend? <Legend />: null
      }
      {
        data.map((dataSet, i) => {
          return (
            <Scatter key={`scatter-${i}`} name={dataSet.name} data={dataSet.data} fill={dataSet.fillColor || getNewColor(i)} />
          )
        })
      }

    </ScatterChart>
  );
}

// todo: choose some nice colours here
const colors = [
  '#cc9e66',
  '#468c6d',
  '#a3b7d9',
  '#998426',
  '#36d9bb',
  '#b9a3d9',
  '#cbd936',
  '#6cd0d9',
  '#8733cc',
  '#c6d9a3',
  '#23678c',
  '#6d468c',
  '#33cc5e',
  '#2d60b3',
]

// returns one of 14 distinct colours
export const getNewColor = (i: number) => {
  if (i > colors.length) {
    throw new Error(`Only ${colors.length} colors have been defined`);
  }
  return colors[i]
}