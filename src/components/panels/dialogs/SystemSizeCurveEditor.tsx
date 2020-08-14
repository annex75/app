// external
import React, { Component } from 'react';
import '@blueprintjs/table/lib/css/table.css';
import { Classes,  } from '@blueprintjs/core';
import { Table, Column, EditableCell, ColumnHeaderCell } from '@blueprintjs/table';

// internal
import { ISystemSizeCurveEditorProps, ISystemSizeCurveEditorState, ISystemSizeCurve } from '../../../types';
import { IChartSetup, getNewColor, renderScatterChart } from '../../../helpers';

export class SystemSizeCurveEditor extends Component<ISystemSizeCurveEditorProps, ISystemSizeCurveEditorState> {
  constructor(props: ISystemSizeCurveEditorProps) {
    super(props);
    this.state = {
      activeEnergySystemId: this.props.activeEnergySystemId,
      systemSizeCurveRows: 5,
    };
  }

  handleValueChange = (row: number, col: number, id: string, systemSizeCurve: ISystemSizeCurve) => {
    return (value: string) => {
      systemSizeCurve.value[row] = Number(value) || 0;
      this.props.handleSystemSizeCurveEdit(systemSizeCurve, id, this.state.activeEnergySystemId);
    }
  }

  renderCell = (rowIndex: number, columnIndex: number, id: string, systemSizeCurve: ISystemSizeCurve) => {
    return (
      <EditableCell
        value={systemSizeCurve.value[rowIndex] == null ? String(0) : String(systemSizeCurve.value[rowIndex])}
        onChange={this.handleValueChange(rowIndex, columnIndex, id, systemSizeCurve)}
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

  render() {
    const { energySystems } = this.props;
    const { activeEnergySystemId } = this.state;
    const activeSystem = energySystems[activeEnergySystemId];
    
    // pretty ugly hack to get them in the right order, but I can't find a way to retain property order in typescript?
    const systemSizeCurvesSorted = Object.keys(activeSystem.systemSizeCurves).sort((a,b) => {
      const tA = activeSystem.systemSizeCurves[a];
      const tB = activeSystem.systemSizeCurves[b];
      return tA.index < tB.index? -1 : tA.index > tB.index? 1 : 0;
    });
    const columns = systemSizeCurvesSorted.map((id: string, index: number) => {
      const systemSizeCurve = activeSystem.systemSizeCurves[id];
      return (
        <Column
          key={String(index)}
          cellRenderer={(r: number, c: number) => this.renderCell(r, c, id, systemSizeCurve)} 
          columnHeaderCellRenderer={(index: number) => this.renderColumnHeader(index, systemSizeCurve.label)}/>
      )
    });

    const xCurve = activeSystem.systemSizeCurves[systemSizeCurvesSorted[0]];

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

    const graphData = systemSizeCurvesSorted.slice(1).map((id: string, index: number) => {

      const costCurve = activeSystem.systemSizeCurves[id] as ISystemSizeCurve;
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
        <p>System type: {activeSystem.systemType}</p>
        <p>System category: {activeSystem.systemCategory}</p>
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