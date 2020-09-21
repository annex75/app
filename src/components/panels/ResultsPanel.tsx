// external
import React, { Component } from 'react';
import { get as _fpGet } from 'lodash/fp';

// internal
import { IResultsPanelProps, IResultsPanelState } from '../../types';
import { renderScatterChart, IChartSetup } from '../../helpers';

interface IResultGraph {
  id: string;
  label: string;
  xDataObj: IGraphDataObj;
  yDataObj: IGraphDataObj;
  mode: "2d"; // todo: implement 3d data
  chartSetup: Partial<IChartSetup>;
}

interface IGraphDataObj {
  dataPath: string; // root path: this.props.project.scenarioData.scenarios[...]
  unit: string;
  label: string;
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

export class ResultsPanel extends Component<IResultsPanelProps, IResultsPanelState> {

  resultGraphs: IResultGraph[] = [
    /*{
      id: "embodiedEnergy",
      label: "Embodied energy vs. annualized specific cost",
      xDataObj: {
        dataPath: "total.annualizedSpecificCost",
        unit: " €/m²a",
        label: "Annualized specific cost",
      },
      yDataObj: {
        dataPath: "total.specificEmbodiedEnergy",
        unit: " kWh/m²",
        label: "Specific embodied energy",
      },
      mode: "2d",
      chartSetup: {
        mode: "2d",
        name: "Scatter chart",
        legend: false,
        label: true,
      }
    },*/{
      id: "primaryEnergyUse",
      label: "Specific primary energy use vs. annualized specific cost",
      xDataObj: {
        dataPath: "total.specificPrimaryEnergyUse",
        unit: " kWh/m²,a",
        label: "Specific primary energy use",
      },
      yDataObj: {
        dataPath: "total.annualizedSpecificCost",
        unit: " €/m²a",
        label: "Annualized specific cost",
      },
      mode: "2d",
      chartSetup: {
        mode: "2d",
        name: "Scatter chart",
        legend: false,
        label: true,
      }
    },{
      id: "emissions",
      label: "Specific greenhouse gas emissions vs. annualized specific cost",
      xDataObj: {
        dataPath: "total.specificEmissions",
        unit: " kg CO₂eq/m²,a",
        label: "Specific greenhouse gas emissions",
      },
      yDataObj: {
        dataPath: "total.annualizedSpecificCost",
        unit: " €/m²a",
        label: "Annualized specific cost",
      },
      mode: "2d",
      chartSetup: {
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
                      x: _fpGet(graph.xDataObj.dataPath, scenario),
                      y: _fpGet(graph.yDataObj.dataPath, scenario),
                    }
                  }),
              
                }
              ];
              let chartSetup: IChartSetup = Object.assign(defChartSetup, graph.chartSetup);
              chartSetup.xUnit = graph.xDataObj.unit;
              chartSetup.yUnit = graph.yDataObj.unit;
              chartSetup.xLabel = graph.xDataObj.label;
              chartSetup.yLabel = graph.yDataObj.label;
              return (
                <div key={`result-graph-${graph.id}-container`} className="result-graph-container">
                  {
                    renderScatterChart(data, chartSetup, )
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