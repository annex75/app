import React, { Component, ChangeEvent } from 'react';

import { set as _fpSet } from 'lodash/fp';
import { Collapse, Button, Card, Intent, Dialog } from '@blueprintjs/core';

//import { CalcData } from '@annex-75/calculation-model/';

import * as config from '../../config.json';
import { ICalcDataPanelProps, ICalcDataPanelState, CalcData, Building, ICalcDataPanelCard, EnergySystem, ICostCurve, TBuildingMeasureCategory, ScenarioInfo, HvacMeasure, EnvelopeMeasure } from '../../types';
import { DistrictCard } from './cards/DistrictCard';
import { BuildingCard } from './cards/BuildingCard';
import { AppToaster } from '../../toaster';
import { EnergySystemsCard } from './cards/EnergySystemsCard';
import { CostCurveEditor } from './dialogs/CostCurveEditor';
import { BuildingMeasuresCard } from './cards/BuildingMeasuresCard';


export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {

  constructor(props: ICalcDataPanelProps) {
    super(props);
    const cards: Record<string, ICalcDataPanelCard> = {
      "district": {
        name: "district",
        title: "District",
        isOpen: false,
        component: DistrictCard,
        eventHandlers: {
          handleChange: this.handleChange,
          handleFileInput: this.handleFileInput,
        },
      },
      "buildings": {
        name: "buildings",
        title: "Building types",
        isOpen: false,
        component: BuildingCard,
        eventHandlers: {
          handleChange: this.handleChange,
          addBuilding: this.addBuilding,
        },
      },
      "energySystems": {
        name: "energySystems",
        title: "Energy systems",
        isOpen: false,
        component: EnergySystemsCard,
        eventHandlers: {
          addEnergySystem: this.addEnergySystem,
          editCostCurve: this.editCostCurve,
          handleChange: this.handleChange,
        },
      },
      "buildingMeasures": {
        name: "buildingMeasures",
        title: "Building renovation measures",
        isOpen: false,
        component: BuildingMeasuresCard,
        eventHandlers: {
          handleChange: this.handleChange,
          addBuildingMeasure: this.addBuildingMeasure,
        },
      },
    }
    this.state = {
      project: props.project,
      cards: cards,
      costCurveEditorIsOpen: false,
      activeEnergySystemId: "",
    }
  }

  handleClick = (e: React.MouseEvent<HTMLElement>, name: string) => {
    let newState = { ...this.state };
    newState.cards[name].isOpen = !newState.cards[name].isOpen;
    this.setState(newState);
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log(e.target.name)
    const path = this.formatPath(e.target.name);
    const newState = _fpSet(path, e.target.value, this.state);
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  // takes a subpath and returns its location in the main data structure
  formatPath = (childPath: string) => {
    return `project.calcData.${childPath}`;
  }

  handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    // todo: handle file input
  }

  handleCostCurveEdit = (costCurve: ICostCurve, costCurveId: string, activeEnergySystemId: string, costCurveType: string) => {
    let newState = { ...this.state };
    newState.project.calcData.energySystems[activeEnergySystemId].costCurves[costCurveType][costCurveId] = costCurve;
    this.setState(newState);
    this.props.updateProject(newState.project);
    console.log(costCurve)
  }

  addBuilding = () => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.calcData.buildings).length >= config.MAX_BUILDINGS) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDINGS} building types are currently allowed`});
      return;
    }
    
    const building = new Building();
    for (const scenarioId in newState.project.scenarioData.scenarios) {
      building.scenarioInfos[scenarioId] = new ScenarioInfo();
    } 

    newState.project.calcData.buildings[building.id] = building;
    

    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  addEnergySystem = () => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.calcData.energySystems).length >= config.MAX_ENERGY_SYSTEMS) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_ENERGY_SYSTEMS} energy systems are currently allowed`});
      return;
    }
    
    const energySystem = new EnergySystem();
    newState.project.calcData.energySystems[energySystem.id] = energySystem;
    
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  addBuildingMeasure = (category: TBuildingMeasureCategory) => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.calcData.buildingMeasures[category]).length >= config.MAX_BUILDING_MEASURES) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDING_MEASURES} building measures are currently allowed per category`});
      return;
    }
    
    const buildingMeasure = this.getBuildingMeasure(category);
    newState.project.calcData.buildingMeasures[category][buildingMeasure.id] = buildingMeasure;
    
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  getBuildingMeasure(category: TBuildingMeasureCategory) {
    switch(category) {
      case "hvac":
        return new HvacMeasure(category);
      default:
        return new EnvelopeMeasure(category);
    }
  }

  editCostCurve = (id: string) => {
    this.setState({ costCurveEditorIsOpen: true, activeEnergySystemId: id });
  }

  closeEditCostCurve = () => {
    this.setState({ costCurveEditorIsOpen: false })
  }

  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        {
          Object.keys(this.state.cards).map(id => {
            const card = this.state.cards[id];
            const data = this.state.project.calcData[id as keyof CalcData];
            return (
              <Card key={`${id}-card`} id={`${id}-card`} elevation={card.isOpen ? 2 : 0} className="panel-card">
                <div className="panel-card-header">
                  <h3 style={{ flexGrow: 1 }}>{card.title}</h3>
                  <Button minimal className="bp3-button" icon={card.isOpen ? "arrow-up" : "arrow-down"} onClick={(e: React.MouseEvent<HTMLElement>) => this.handleClick(e, id)}/>
                </div>
                <Collapse key={`${id}-collapse`} isOpen={card.isOpen}>
                  <PanelCard component={card.component} data={data} {...card.eventHandlers} />
                </Collapse>
              </Card>
            )
          })
        }
        <Dialog className="cost-curve-editor-dialog" isOpen={this.state.costCurveEditorIsOpen} onClose={this.closeEditCostCurve} >
          <CostCurveEditor
            activeEnergySystemId={this.state.activeEnergySystemId}
            energySystems={this.state.project.calcData.energySystems}
            handleCostCurveEdit={this.handleCostCurveEdit}/>
        </Dialog>
      </div>
    )
  }
}

const PanelCard = ({ component: Component, ...rest }: any) => {
  return <Component {...rest} />
}