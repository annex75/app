import React, { Component, ChangeEvent } from 'react';

import '@blueprintjs/table/lib/css/table.css';

import { MenuItem, Button, Classes, FormGroup } from '@blueprintjs/core';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { Table, Column, EditableCell, EditableName, ColumnHeaderCell } from '@blueprintjs/table';
import { ICostCurveType, ICostCurveEditorProps, ICostCurveEditorState, ICostCurve } from '../../../types';
import { ScatterChart, CartesianGrid, XAxis, YAxis, Scatter } from 'recharts';

const CostCurveSelect = Select.ofType<ICostCurveType>();
const renderCostCurveType: ItemRenderer<ICostCurveType> = (type, { handleClick, modifiers }) => {
  return ( 
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={type.label}
      key={type.name}
      onClick={handleClick}
    />
  )
}

export class CostCurveEditor extends Component<ICostCurveEditorProps, ICostCurveEditorState> {
  costCurveTypes: ICostCurveType[];

  constructor(props: ICostCurveEditorProps) {
    super(props);
    this.costCurveTypes = [
      {
        name: "investment",
        label: "Investment cost",
        unit: "euro/a"
      },
      {
        name: "maintenance",
        label: "Maintenance cost",
        unit: "euro/a"
      },
      {
        name: "embodiedEnergy",
        label: "Embodied energy",
        unit: "kWh/"
      }
    ]
    this.state = {
      activeEnergySystemId: this.props.activeEnergySystemId,
      costCurveType: this.costCurveTypes[0],
      costCurveRows: 5,
    };
  }

  handleChangeCostCurveType = (costCurveType: ICostCurveType) => {
    this.setState({ costCurveType });
  }

  handleValueChange = (row: number, col: number, id: string, costCurve: ICostCurve) => {
    return (value: string) => {
      costCurve.value[row] = Number(value) || 0;
      this.props.handleCostCurveEdit(costCurve, id, this.state.activeEnergySystemId, this.state.costCurveType.name);
    }
  }

  renderCell = (rowIndex: number, columnIndex: number, id: string, costCurve: ICostCurve) => {
    if(rowIndex === 0 && columnIndex === 1) {
      console.log(costCurve.value[rowIndex]);
    }
    return (
      <EditableCell
        value={costCurve.value[rowIndex] == null ? String(0) : String(costCurve.value[rowIndex])}
        onChange={this.handleValueChange(rowIndex, columnIndex, id, costCurve)}
      />
    );
  };

  renderColumnHeader = (columnIndex: number, label: string) => {
    
    
    /*const nameRenderer = (name: string) => {
      return (
        <EditableName
          name={name}
        />
      );
    };*/
    return <ColumnHeaderCell name={label} />;
  };

  chartSettings = {
    width: 400,
    height: 200,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  }

  placeholderData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
  ]

  render() {
    const { energySystems } = this.props;
    const { costCurveType, activeEnergySystemId } = this.state;
    const activeSystem = energySystems[activeEnergySystemId];
    
    // pretty ugly hack to get them in the right order, but I can't find a way to retain property order in typescript?
    const costCurvesSorted = Object.keys(activeSystem.costCurves[costCurveType.name]).sort((a,b) => {
      const tA = activeSystem.costCurves[costCurveType.name][a] as ICostCurve;
      const tB = activeSystem.costCurves[costCurveType.name][b] as ICostCurve;
      return tA.index < tB.index? -1 : tA.index > tB.index? 1 : 0;
    });
    const columns = costCurvesSorted.map((id: string, index: number) => {
      const costCurve = activeSystem.costCurves[costCurveType.name][id] as ICostCurve;
      return (
        <Column
          key={String(index)}
          cellRenderer={(r: number, c: number) => this.renderCell(r, c, id, costCurve)} 
          columnHeaderCellRenderer={(index: number) => this.renderColumnHeader(index, costCurve.label)}/>
      )
    });

    return (
      <div className={Classes.DIALOG_BODY}>
        <h3>{activeSystem.name}</h3>
        <p>System type: {activeSystem.systemType}</p>
        <p>System category: {activeSystem.systemCategory}</p>
        <FormGroup
          inline
          className="inline-input"
          key={`cost-curve-type-form`}
          label="Select cost curve type:"
          labelFor="cost-curve-type-button">
          <CostCurveSelect
            items={this.costCurveTypes.map( t => {
              return t;
            })}
            resetOnQuery={false}
            filterable={false}
            itemRenderer={renderCostCurveType}
            onItemSelect={this.handleChangeCostCurveType}
            >
            <Button
              id="cost-curve-type-button"
              rightIcon="caret-down"
              text={costCurveType.label}
            />
          </CostCurveSelect>
        </FormGroup>
        <Table
          numRows={this.state.costCurveRows}
          enableRowHeader={false}
          >
          {columns}
        </Table>
        <h2>Cost curves</h2>
        <ScatterChart {...this.chartSettings}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="x" unit="-" />
          <YAxis type="number" dataKey="y" name="y" unit="-" />
          <Scatter name="Placeholder data" data={this.placeholderData} fill="#8884d8" />

        </ScatterChart>
      </div>
    )
  }
}