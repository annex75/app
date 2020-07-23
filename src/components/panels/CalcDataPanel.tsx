import React, { Component, ChangeEvent } from 'react';

import { set as _fpSet, equals as _fpEquals } from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';

import { cloneDeep as _cloneDeep, debounce as _debounce } from 'lodash';
import { Collapse, Button, Card, Intent, Dialog } from '@blueprintjs/core';

//import { CalcData } from '@annex-75/calculation-model/';

import * as config from '../../config.json';
import { ICalcDataPanelProps, ICalcDataPanelState, CalcData, BuildingType, ICalcDataPanelCard, EnergySystem, ICostCurve, TBuildingMeasureCategory, ScenarioInfo, HvacMeasure, EnvelopeMeasure, BasementMeasure, WindowMeasure, EnergyCarrier } from '../../types';
import { DistrictCard } from './cards/DistrictCard';
import { BuildingTypeCard } from './cards/BuildingTypeCard';
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
          handleFileUpload: this.handleFileUpload,
        },
        functions: {
          renderFileUploader: this.props.renderFileUploader,
        }
      },
      "buildingTypes": {
        name: "buildingTypes",
        title: "Building types",
        isOpen: false,
        component: BuildingTypeCard,
        eventHandlers: {
          handleChange: this.handleChangeEvent,
          deleteBuildingType: this.deleteBuildingType,
          copyBuildingType: this.copyBuildingType,
          addBuildingType: this.addBuildingType,
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
    this.updateProjectDebounce();
  }
  updateProject = () => this.props.updateProject(this.state.project);
  updateProjectDebounce = _debounce(this.updateProject, 1000);

  // takes a subpath and returns its location in the main data structure
  formatPath = (childPath: string) => {
    return `project.calcData.${childPath}`;
  }

  handleFileUpload = (fileName: string, task: any) => {
    // todo: handle file input
  }

  handleCostCurveEdit = (costCurve: ICostCurve, costCurveId: string, activeEnergySystemId: string, costCurveType: string) => {
    let newState = { ...this.state };
    newState.project.calcData.energySystems[activeEnergySystemId].costCurves[costCurveType][costCurveId] = costCurve;
    this.setState(newState);
    this.updateProjectDebounce();
  }

  addBuildingType = () => {
    let newState = { ...this.state };

    if (Object.keys(newState.project.calcData.buildingTypes).length >= config.MAX_BUILDING_TYPES) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDING_TYPES} building types are currently allowed`});
      return;
    }
    
    let buildingType = new BuildingType();
    for (const scenarioId in newState.project.scenarioData.scenarios) {
      buildingType.scenarioInfos[scenarioId] = new ScenarioInfo();
    } 

    newState.project.calcData.buildingTypes[buildingType.id] = buildingType;
    
    this.setState(newState);
    this.updateProjectDebounce();
  }

  copyBuildingType = (id: string) => {
    let newState = { ...this.state };
    if (Object.keys(newState.project.calcData.buildingTypes).length >= config.MAX_BUILDING_TYPES) {
      AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDING_TYPES} building types are currently allowed`});
      return;
    }
    
    const buildingType = newState.project.calcData.buildingTypes[id];
    if (!buildingType) {
      throw new Error(`Building type ${id} could not be found`);
    } 
    
    const copyName = `${buildingType.name} - copy`;
    
    let buildingTypeClone = _cloneDeep(buildingType);
    buildingTypeClone.id = uuidv4();
    buildingTypeClone.name = copyName;

    newState.project.calcData.buildingTypes[buildingTypeClone.id] = buildingTypeClone;

    this.setState(newState);
    this.updateProjectDebounce();
  }

  // todo: actually delete it from the database (similar to deleting projects)
  deleteBuildingType = (id: string) => {
    let newState = { ...this.state };
    if (Object.keys(newState.project.calcData.buildingTypes).length <= 1) {
      AppToaster.show({ intent: Intent.DANGER, message: `The last building type can not be deleted.`});
      return;
    }
    
    const buildingType = newState.project.calcData.buildingTypes[id];
    if (!buildingType) {
      throw new Error(`Building type ${id} could not be found`);
    }
    newState.project.calcData.buildingTypes[id].deleted = true;
    this.setState(newState);
    this.updateProjectDebounce();
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
    this.updateProjectDebounce();
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
    this.updateProjectDebounce();
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
    this.updateProjectDebounce();
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
              <Card key={`${id}-card`} id={`${id}-card`} elevation={card.isOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
                <div className="panel-card-header" onClick={(e: React.MouseEvent<HTMLElement>) => this.handleClick(e, id)}>
                  <h3 style={{ flexGrow: 1 }}>{card.title}</h3>
                  <Button minimal className="bp3-button" icon={card.isOpen ? "arrow-up" : "arrow-down"}/>
                </div>
                <Collapse key={`${id}-collapse`} isOpen={card.isOpen}>
                  <PanelCard component={card.component} data={data} {...card.eventHandlers} {...card.functions} />
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