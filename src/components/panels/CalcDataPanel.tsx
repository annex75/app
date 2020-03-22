import React, { Component, ChangeEvent } from 'react';

import { set as _fpSet, equals as _fpEquals } from 'lodash/fp';
import { Collapse, Button, Card, Intent, Dialog } from '@blueprintjs/core';

//import { CalcData } from '@annex-75/calculation-model/';

import * as config from '../../config.json';
import { ICalcDataPanelProps, ICalcDataPanelState, CalcData, Building, ICalcDataPanelCard, EnergySystem, ICostCurve, TBuildingMeasureCategory, ScenarioInfo, HvacMeasure, EnvelopeMeasure, BasementMeasure, WindowMeasure, EnergyCarrier } from '../../types';
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
          handleChange: this.handleChangeEvent,
          handleChangePath: this.handleChange,
          handleFileInput: this.handleFileInput,
        },
      },
      "buildings": {
        name: "buildings",
        title: "Building types",
        isOpen: false,
        component: BuildingCard,
        eventHandlers: {
          handleChange: this.handleChangeEvent,
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
          addEnergyCarrier: this.addEnergyCarrier,
          editCostCurve: this.editCostCurve,
          handleChange: this.handleChangeEvent,
        },
      },
      "buildingMeasures": {
        name: "buildingMeasures",
        title: "Building renovation measures",
        isOpen: false,
        component: BuildingMeasuresCard,
        eventHandlers: {
          handleChange: this.handleChangeEvent,
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

  componentDidUpdate(prevProps: ICalcDataPanelProps) {
    if (!_fpEquals(prevProps, this.props)) {
      this.setState({ project: this.props.project, })
    }
  }

  handleClick = (e: React.MouseEvent<HTMLElement>, name: string) => {
    let newState = { ...this.state };
    newState.cards[name].isOpen = !newState.cards[name].isOpen;
    this.setState(newState);
  }

  handleChangeEvent = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const path = this.formatPath(e.target.name);
    const value = e.target.value;
    this.handleChange(path, value);
  }

  // todo: this function should be able to tell if a local or root path is provided and act accordingly
  // todo: it's also inappropriately named
  handleChange = (path: string, value: any) => {
    const newState = _fpSet(path, value, this.state);
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
  }

  addBuilding = () => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.calcData.buildings).length >= config.MAX_BUILDINGS) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDINGS} building types are currently allowed`});
      return;
    }
    
    let building = new Building();
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

  addEnergyCarrier = () => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.calcData.energyCarriers).length >= config.MAX_ENERGY_CARRIERS) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_ENERGY_CARRIERS} energy carriers are currently allowed`});
      return;
    }
    
    const energyCarrier = new EnergyCarrier();
    newState.project.calcData.energyCarriers[energyCarrier.id] = energyCarrier;
    
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
      case "windows":
        return new WindowMeasure(category);
      case "foundation":
        return new BasementMeasure(category);
      default:
        return new EnvelopeMeasure(category);
    }
  }

  getData = (id: string) => {
    switch(id) {
      case "energySystems":
        return { 
          energySystems: this.state.project.calcData.energySystems,
          energyCarriers: this.state.project.calcData.energyCarriers,
        }
      default:
        return this.state.project.calcData[id as keyof CalcData]
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
            const data = this.getData(id as keyof CalcData);
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