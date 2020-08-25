// external
import React, { Component } from 'react';
import { get as _fpGet } from 'lodash/fp';

// internal
import { IResultsPanelProps, IResultsPanelState } from '../../types';
import { renderScatterChart, IChartSetup } from '../../helpers';

interface IResultGraph {
  id: string;
  label: string;
  xDataPath: string; // root path: this.props.project.scenarioData.scenarios[...]
  yDataPath: string; // root path: this.props.project.scenarioData.scenarios[...]
  mode: "2d"; // todo: implement 3d data
  chartSetup: IChartSetup;
}

export class ResultsPanel extends Component<IResultsPanelProps, IResultsPanelState> {

  resultGraphs: IResultGraph[] = [
    {
      id: "embodiedEnergy",
      label: "Embodied energy vs. annualized specific cost",
      xDataPath: "total.annualizedSpecificCost",
      yDataPath: "total.specificEmbodiedEnergy",
      mode: "2d",
      chartSetup: {
        xUnit: " €/m²a",
        xLabel: "Annualized specific cost",
        xKey: 'x',
        yUnit: " kWh/m²",
        yLabel: "Specific embodied energy",
        yKey: 'y',
        mode: "2d",
        name: "Scatter chart",
        legend: false,
        label: true,
      }
    },{
      id: "primaryEnergyUse",
      label: "Specific primary energy use vs. annualized specific cost",
      xDataPath: "total.annualizedSpecificCost",
      yDataPath: "total.specificPrimaryEnergyUse",
      mode: "2d",
      chartSetup: {
        xUnit: " €/m²a",
        xLabel: "Annualized specific cost",
        xKey: 'x',
        yUnit: " kWh/m²,a",
        yLabel: "Specific primary energy use",
        yKey: 'y',
        mode: "2d",
        name: "Scatter chart",
        legend: false,
        label: true,
      }
    },{
      id: "emissions",
      label: "Specific greenhouse gas emissions vs. annualized specific cost",
      xDataPath: "total.annualizedSpecificCost",
      yDataPath: "total.specificEmissions",
      mode: "2d",
      chartSetup: {
        xUnit: " €/m²a",
        xLabel: "Annualized specific cost",
        xKey: 'x',
        yUnit: " kg CO₂eq/m²,a",
        yLabel: "Specific greenhouse gas emissions",
        yKey: 'y',
        mode: "2d",
        name: "Scatter chart",
        legend: false,
        label: true,
      }
    },
  ]
  
  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <div className="bp3-card panel-card">
          {
            this.resultGraphs.map(graph => {
              const data = [
                {
                  name: graph.label,
                  data: Object.keys(this.props.project.scenarioData.scenarios).map(scenarioId => {
                    const scenario = this.props.project.scenarioData.scenarios[scenarioId];
                    return {
                      x: _fpGet(graph.xDataPath, scenario),
                      y: _fpGet(graph.yDataPath, scenario),
                    }
                  }),
              
                }
              ];
              return (
                <div key={`result-graph-${graph.id}-container`} className="result-graph-container">
                  {
                    renderScatterChart(data, graph.chartSetup, )
                  }
                </div>
              )
            })
          }
        </div>
        <div className="bp3-card panel-card">Tabulated results</div>
      </div>
    )
  }
}