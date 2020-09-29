// external
import React, { Component } from 'react';
import '@blueprintjs/table/lib/css/table.css';
import { Classes, FormGroup, Button,  } from '@blueprintjs/core';
import { Table, Column, EditableCell, ColumnHeaderCell } from '@blueprintjs/table';

// internal
import { ISystemSizeCurveEditorProps, ISystemSizeCurveEditorState, ISystemSizeCurve, getEnergySystemType, getEnergySystemCategory, ICostCurveScale, Units } from '../../../types';
import { IChartSetup, getNewColor, renderScatterChart } from '../../../helpers';
import { CostCurveScaleSelect, renderCostCurveScale } from './CostCurveEditor';

export class SystemSizeCurveEditor extends Component<ISystemSizeCurveEditorProps, ISystemSizeCurveEditorState> {
  costCurveScales: ICostCurveScale[];
  constructor(props: ISystemSizeCurveEditorProps) {
    super(props);
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
      systemSizeCurveRows: 5,
      costCurveScale: this.costCurveScales[0],
    };
  }

  handleChangeCostCurveScale = (costCurveScale: ICostCurveScale) => {
    this.setState({ costCurveScale });
  }

  handleValueChange = (row: number, col: number, id: string, systemSizeCurve: ISystemSizeCurve) => {
    return (value: string) => {
      systemSizeCurve.value[row] = +value || 0;
      this.props.handleSystemSizeCurveEdit(systemSizeCurve, id, this.state.costCurveScale.name, this.state.activeEnergySystemId);
    }
  }

  renderCell = (rowIndex: number, columnIndex: number, id: string, systemSizeCurve: ISystemSizeCurve) => {
    return (
      <EditableCell
        value={systemSizeCurve.value[rowIndex] == null ? String(0) : String(systemSizeCurve.value[rowIndex])}
        onConfirm={this.handleValueChange(rowIndex, columnIndex, id, systemSizeCurve)}
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
    const { activeEnergySystemId, costCurveScale } = this.state;
    const activeSystem = energySystems[activeEnergySystemId];
    
    // pretty ugly hack to get them in the right order, but I can't find a way to retain property order in typescript?
    const systemSizeCurvesSorted = Object.keys(activeSystem.systemSizeCurves[costCurveScale.name]).sort((a,b) => {
      const tA = activeSystem.systemSizeCurves[costCurveScale.name][a];
      const tB = activeSystem.systemSizeCurves[costCurveScale.name][b];
      return tA.index < tB.index? -1 : tA.index > tB.index? 1 : 0;
    });
    const columns = systemSizeCurvesSorted.map((id: string, index: number) => {
      const systemSizeCurve = activeSystem.systemSizeCurves[costCurveScale.name][id];
      return (
        <Column
          key={String(index)}
          cellRenderer={(r: number, c: number) => this.renderCell(r, c, id, systemSizeCurve)} 
          columnHeaderCellRenderer={(index: number) => this.renderColumnHeader(index, systemSizeCurve.label, systemSizeCurve.unit)}/>
      )
    });

    const xCurve = activeSystem.systemSizeCurves[costCurveScale.name][systemSizeCurvesSorted[0]];

    const chartSetup: IChartSetup = {
      xUnit: " kWh",
      xLabel: "Total energy need",
      xKey: 'x',
      yUnit: ` kW`,
      yLabel: "System size",
      yKey: 'y',
      mode: "2d",
      name: "Scatter chart"
    }

    // a little hack here to only get the system size curve
    const graphData = [systemSizeCurvesSorted[1]].map((id: string, index: number) => {

      const costCurve = activeSystem.systemSizeCurves[costCurveScale.name][id] as ISystemSizeCurve;
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
            key={`cost-curve-type-form`}
            label="Select cost curve type:"
            labelFor="cost-curve-type-button">
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
        <Table
          numRows={this.state.systemSizeCurveRows}
          enableRowHeader={false}
          >
          {columns}
        </Table>
        <h2>System size curves</h2>
        {
          renderScatterChart(graphData, chartSetup )
        }
      </div>
    )
  }
}