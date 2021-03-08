// external
import React, { Component } from 'react';
import '@blueprintjs/table/lib/css/table.css';
import { MenuItem, Button, Classes, FormGroup } from '@blueprintjs/core';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { Table, Column, EditableCell, ColumnHeaderCell } from '@blueprintjs/table';

// internal
import { ICostCurveCategory, ICostCurveEditorProps, ICostCurveEditorState, ICostCurve, getEnergySystemCategory, getEnergySystemType, ICostCurveScale, Units } from '../../../types';
import { renderScatterChart, getNewColor, IChartSetup } from '../../../helpers';

const CostCurveSelect = Select.ofType<ICostCurveCategory>();
const renderCostCurveType: ItemRenderer<ICostCurveCategory> = (type, { handleClick, modifiers }) => {
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

export const CostCurveScaleSelect = Select.ofType<ICostCurveScale>();
export const renderCostCurveScale: ItemRenderer<ICostCurveScale> = (type, { handleClick, modifiers }) => {
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
  costCurveCategories: ICostCurveCategory[];
  costCurveScales: ICostCurveScale[];

  constructor(props: ICostCurveEditorProps) {
    super(props);
    this.costCurveCategories = [
      {
        name: "investmentCost",
        label: "Investment cost",
        unit: "euro",
      },
      {
        name: "maintenanceCost",
        label: "Maintenance cost",
        unit: "euroPerYear"
      },
      {
        name: "embodiedEnergy",
        label: "Embodied energy",
        unit: "kiloWattHourPerMeterSqYear"
      }
    ];
    this.costCurveScales = [
      {
        name: "substation",
        label: "Individual system",
      },{
        name: "centralized",
        label: "Centralised system",
      },
    ];
    this.state = {
      activeEnergySystemId: this.props.activeEnergySystemId,
      costCurveCategory: this.costCurveCategories[0],
      costCurveScale: this.costCurveScales[0],
      costCurveRows: 5,
    };
  }

  handleChangeCostCurveType = (costCurveCategory: ICostCurveCategory) => {
    this.setState({ costCurveCategory });
  }

  handleChangeCostCurveScale = (costCurveScale: ICostCurveScale) => {
    this.setState({ costCurveScale });
  }

  handleValueChange = (row: number, col: number, id: string, costCurve: ICostCurve) => {
    return (value: string) => {
      costCurve.value[row] = +value || 0;
      this.props.handleCostCurveEdit(costCurve, id, this.state.activeEnergySystemId, this.state.costCurveScale.name, this.state.costCurveCategory.name);
    }
  }

  renderCell = (rowIndex: number, columnIndex: number, id: string, costCurve: ICostCurve) => {
    return (
      <EditableCell
        value={costCurve.value[rowIndex] == null ? String(0) : String(costCurve.value[rowIndex])}
        onConfirm={this.handleValueChange(rowIndex, columnIndex, id, costCurve)}
      />
    );
  };

  renderColumnHeader = (columnIndex: number, label: string, unit: keyof typeof Units) => {
    
    
    /*const nameRenderer = (name: string) => {
      return (
        <EditableName
          name={name}
        />
      );
    };*/
    return <ColumnHeaderCell name={`${label}${unit? ` [${Units[unit]}]`: ''}`} />;
  };

  render() {
    const { energySystems } = this.props;
    const { costCurveCategory, costCurveScale, activeEnergySystemId } = this.state;
    const activeSystem = energySystems[activeEnergySystemId];
    
    // pretty ugly hack to get them in the right order, but I can't find a way to retain property order in typescript?
    const costCurvesSorted = Object.keys(activeSystem.costCurves[costCurveScale.name][costCurveCategory.name]).sort((a,b) => {
      const tA = activeSystem.costCurves[costCurveScale.name][costCurveCategory.name][a] as ICostCurve;
      const tB = activeSystem.costCurves[costCurveScale.name][costCurveCategory.name][b] as ICostCurve;
      return tA.index < tB.index? -1 : tA.index > tB.index? 1 : 0;
    });
    const columns = costCurvesSorted.map((id: string, index: number) => {
      const costCurve = activeSystem.costCurves[costCurveScale.name][costCurveCategory.name][id] as ICostCurve;
      return (
        <Column
          key={String(index)}
          cellRenderer={(r: number, c: number) => this.renderCell(r, c, id, costCurve)} 
          columnHeaderCellRenderer={(index: number) => this.renderColumnHeader(index, costCurve.label, costCurve.unit)}/>
      )
    });

    const xCurve = activeSystem.costCurves[costCurveScale.name][costCurveCategory.name][costCurvesSorted[0]];

    const chartSetup: IChartSetup = {
      xUnit: " kW",
      xLabel: "System size",
      xKey: 'x',
      yUnit: ` ${Units[costCurveCategory.unit]}`,
      yLabel: costCurveCategory.label,
      yKey: 'y',
      mode: "2d",
      name: "Scatter chart"
    }

    const graphData = costCurvesSorted.slice(1).map((id: string, index: number) => {

      const costCurve = activeSystem.costCurves[costCurveScale.name][costCurveCategory.name][id] as ICostCurve;
      return {
        name: costCurve.label,
        fillColor: getNewColor(index),
        data: costCurve.value.map((v, i) => {
          return {
            x: xCurve.value[i],
            y: v,
          }
        })
      }
    })

    return (
      <div className={Classes.DIALOG_BODY}>
        <h3>{activeSystem.name}</h3>
        <p>System type: {getEnergySystemType(activeSystem.systemType).name}</p>
        <p>System category: {getEnergySystemCategory(activeSystem.systemCategory).name}</p>
        {
          activeSystem.systemCategory === 'centralized'? <FormGroup
            inline
            className="inline-input"
            key={`cost-curve-category-form`}
            label="Select cost curve scale:"
            labelFor="cost-curve-scale-select">
            <CostCurveScaleSelect
              items={this.costCurveScales.map( t => {
                return t;
              })}
              resetOnQuery={false}
              filterable={false}
              itemRenderer={renderCostCurveScale}
              onItemSelect={this.handleChangeCostCurveScale}
              >
              <Button
                id="cost-curve-category-button"
                rightIcon="caret-down"
                text={costCurveScale.label}
              />
            </CostCurveScaleSelect>
          </FormGroup> 
          : null
        }
        <FormGroup
          inline
          className="inline-input"
          key={`cost-curve-type-form`}
          label="Select cost curve type:"
          labelFor="cost-curve-type-button">
          <CostCurveSelect
            items={this.costCurveCategories.map( t => {
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
              text={costCurveCategory.label}
            />
          </CostCurveSelect>
        </FormGroup>
        <Table
          numRows={this.state.costCurveRows}
          enableRowHeader={false}
          enableFocusedCell={true}
          getCellClipboardData={(row: number, col: number) => 
            {
              return activeSystem.costCurves[costCurveScale.name][costCurveCategory.name][costCurvesSorted[col]].value[row];
            }}
          >
          {columns}
        </Table>
        <h3>Cost curves</h3>
        {
          renderScatterChart(graphData, chartSetup )
        }
      </div>
    )
  }
}