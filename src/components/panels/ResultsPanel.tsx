// external
import React, { Component } from 'react';
import { get as _fpGet } from 'lodash/fp';
import html2pdf from 'html2pdf.js';

// internal
import { IResultsPanelProps, IResultsPanelState, Scenario, Units, IProject, printableProjectData } from '../../types';
import { renderScatterChart, IChartSetup, InfoButton, getCurrentTime } from '../../helpers';
import { Button } from '@blueprintjs/core';
import { Table, Column, ColumnHeaderCell, Cell } from '@blueprintjs/table';

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
  
  constructor(props: IResultsPanelProps) {
    super(props);
    this.state = {
      printData: false,
    }
  }

  resultGraphs: IResultGraph[] = [
    /*{
      id: "embodiedEmissions",
      label: "Embodied Emissions vs. annualized specific cost",
      xDataObj: {
        dataPath: "total.annualizedSpecificCost",
        unit: " €/m²a",
        label: "Annualized specific cost",
      },
      yDataObj: {
        dataPath: "total.specificEmbodiedEmissions",
        unit: " kWh/m²",
        label: "Specific embodied emissions",
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
        legend: true,
        label: true,
      }
    },{
      id: "emissions",
      label: "Specific carbon emissions vs. annualized specific cost",
      xDataObj: {
        dataPath: "total.specificEmissions",
        unit: " kg CO₂eq/m²,a",
        label: "Specific carbon emissions",
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
        legend: true,
        label: true,
        legendSettings: {
          verticalAlign: "middle",
          layout: "vertical",
          align: "right",
          wrapperStyle: { paddingLeft: "20px" },
        }
      }
    },
  ];

  beginPrintPdf = () => {
    this.setState({ printData: true },
      this.printPdf);
  }

  // this is pretty HACKy to print the input data without rendering it
  printPdf = () => {
    
    const container = document.createElement('div');    
    
    const cloneGraphs = document.getElementById("results-graph-container")!.cloneNode(true);
    const cloneInputData = document.getElementById("hidden-input-data")!.cloneNode(true) as HTMLDivElement;

    cloneInputData.style.display = "block";
    cloneInputData.style.pageBreakBefore = "always";
    
    container.appendChild(cloneGraphs);
    container.appendChild(cloneInputData);

    const worker = html2pdf().set({
      pagebreak: { mode: 'avoid-all', before: '#page2el' }
    });

    const options = {
      margin:       1,
      filename:     `annex-75-tool-report-${getCurrentTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    worker.from(container).using(options).save().then(() => {
      container.remove();
      this.setState({ printData: false });
    });
  }

  getTableData = (scenarios: Scenario[]) => {
    const legendColumn = [
      `Specific primary energy use [${Units.kiloWattHourPerMeterSqYear}]`,
      `Annualised specific cost [${Units.euroPerMeterSq}]`,
      `Specific carbon emissions [${Units.kiloGramCO2EqPerYear}]`,
      `Total system size (centralised systems) [${Units.kiloWatt}]`,
      `Total system size (decentralised systems) [${Units.kiloWatt}]`,
    ]
    return [legendColumn, ...scenarios.map(scenario => {
      return [
        scenario.total.specificPrimaryEnergyUse,
        scenario.total.annualizedSpecificCost,
        scenario.total.specificEmissions,
        scenario.total.centralizedSystemSize,
        scenario.total.decentralizedSystemSize,
      ];
    })];
  }
  
  getTableColumns = (tableData: any[][], scenarios: Scenario[]) => {
    const legendColumn = <Column
      key={`legend-table-column`}
      cellRenderer={(r: number, c: number) => <Cell>{tableData[c][r]}</Cell>}
      columnHeaderCellRenderer={() => <ColumnHeaderCell/>}/>
    return [legendColumn, ...scenarios.map(scenario => {
      return (
      <Column
        key={`${scenario.id}-table-column`}
        cellRenderer={(r: number, c: number) => <Cell>{tableData[c][r]}</Cell>} 
        columnHeaderCellRenderer={(index: number) => <ColumnHeaderCell name={scenario.name}/>}/>
      )
    })];
  }

  // todo: this could be generated in a smarter way
  getInputData = () => {
    const { project } = this.props;
    return this.printProjectData(project)
  }

  // todo: should this reside here? In Data.tsx makes no sense
  printProjectData = (project: IProject) => {
    return (
      <div>
        {printableProjectData(project).map((printableObj, i) => {
          if (printableObj.level && ["h2", "h3", "h4"].includes(printableObj.level)) {
            const Comp = `${printableObj.level}` as keyof JSX.IntrinsicElements;
            return <Comp key={`print-project-data-${i}`}>{printableObj.name}</Comp>
          } else if ("value" in printableObj) {
            return (<p key={`print-project-data-${i}`}>
              {printableObj.name}: {printableObj.value}
              {printableObj.unit? ` [${printableObj.unit}]`: null}
            </p>)
          } else {
            return null;
          }
        })}
      </div>
    )
  }
        
  render() {
    const activeScenarioIds = Object.keys(this.props.project.scenarioData.scenarios).filter(id => {
      return !this.props.project.scenarioData.scenarios[id].deleted;
    });
    const activeScenarios = activeScenarioIds.map(id => this.props.project.scenarioData.scenarios[id]);
    const tableData = this.getTableData(activeScenarios);
    const columns = this.getTableColumns(tableData, activeScenarios);
    return (
      <div>
        <InfoButton level={1} label={this.props.title}/>
        <div className="bp3-card panel-card">
          <h3>Graphical results</h3>
          <div id="results-graph-container" >
            <p>Project name: {this.props.project.name}</p>
            <p>Report generated: {getCurrentTime()}</p>
            <p>Calculation performed by: {this.props.project.overviewData.contactInfo.name}</p>
            {
              this.resultGraphs.map(graph => {
                const data = activeScenarios.map(scenario => {
                  return {
                    name: scenario.name,
                    data: [{
                      name: scenario.name,
                      x: _fpGet(graph.xDataObj.dataPath, scenario),
                      y: _fpGet(graph.yDataObj.dataPath, scenario),
                    }],
                  }
                });
                let chartSetup: IChartSetup = Object.assign(defChartSetup, graph.chartSetup);
                chartSetup.xUnit = graph.xDataObj.unit;
                chartSetup.yUnit = graph.yDataObj.unit;
                chartSetup.xLabel = graph.xDataObj.label;
                chartSetup.yLabel = graph.yDataObj.label;
                return (
                  <div key={`result-graph-${graph.id}-container`} className="result-graph-container">
                    <h4>{graph.label}</h4>
                    {
                      renderScatterChart(data, chartSetup)
                    }

                  </div>
                )
              })
            }
          </div>
        </div>
        <div className="bp3-card panel-card">
          <h3>Tabulated results</h3>
          <Table
            columnWidths={[275, ...columns.slice(1).map(() => 100)]}
            enableColumnResizing={false}
            numRows={tableData[0].length}
            enableRowHeader={false}
            enableFocusedCell={true}
            getCellClipboardData={(r: number, c: number) => 
              {
                return tableData[c][r];
              }}
            >
            {columns}
          </Table>
        </div>
        <div id="results-button-container" className="bp3-card panel-card">
          <Button minimal icon="print" onClick={this.beginPrintPdf} style={{ padding: "10px" }}>Save results as PDF</Button>
        </div>
        {/* This div is only here to be able to print the input data without rendering it */}
        <div id="hidden-input-data" style={{ display: "none" }}>
          {this.state.printData? this.getInputData() : null}
        </div>
      </div>
    )
  }
}