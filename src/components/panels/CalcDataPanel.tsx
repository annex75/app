// external
import React, { Component, ChangeEvent } from 'react';
import { set as _fpSet, equals as _fpEquals } from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep as _cloneDeep, debounce as _debounce } from 'lodash';
import { Collapse, Button, Card, Intent, Dialog } from '@blueprintjs/core';


// internal
//import { CalcData } from '@annex-75/calculation-model/';
import * as config from '../../config.json';
import { ICalcDataPanelProps, ICalcDataPanelState, CalcData, BuildingType, ICalcDataPanelCard, EnergySystem, ICostCurve, TBuildingMeasureCategory, HvacMeasure, EnvelopeMeasure, WindowMeasure, EnergyCarrier, TCostCurveCategory, TCostCurveScale, ScenarioInfo } from '../../types';
import { DistrictCard } from './cards/DistrictCard';
import { BuildingTypeCard } from './cards/BuildingTypeCard';
import { AppToaster } from '../../toaster';
import { EnergySystemsCard } from './cards/EnergySystemsCard';
import { CostCurveEditor } from './dialogs/CostCurveEditor';
import { BuildingMeasuresCard } from './cards/BuildingMeasuresCard';
import { IDropdownAlt, InfoButton } from '../../helpers';
import { documentation } from '../../constants/textData';

export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {

  constructor(props: ICalcDataPanelProps) {
    super(props);
    const cards: Record<string, ICalcDataPanelCard> = {
      district: {
        name: "district",
        title: "District",
        info: documentation.districtCard,
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
      buildingTypes: {
        name: "buildingTypes",
        title: "Building types",
        info: documentation.buildingTypes,
        isOpen: false,
        component: BuildingTypeCard,
        eventHandlers: {
          handleChange: this.handleChangeEvent,
          handleDropdownChange: this.handleDropdownChange,
          deleteBuildingType: this.deleteBuildingType,
          copyBuildingType: this.copyBuildingType,
          addBuildingType: this.addBuildingType,
        },
      },
      energySystems: {
        name: "energySystems",
        title: "Energy systems",
        info: documentation.energySystems,
        isOpen: false,
        component: EnergySystemsCard,
        eventHandlers: {
          addEnergySystem: this.addEnergySystem,
          addEnergyCarrier: this.addEnergyCarrier,
          editCostCurve: this.editCostCurve,
          handleChange: this.handleChangeEvent,
          handleDropdownChange: this.handleDropdownChange,
          copyEnergySystem: this.copyEnergySystem,
          deleteEnergySystem: this.deleteEnergySystem,
          copyEnergyCarrier: this.copyEnergyCarrier,
          deleteEnergyCarrier: this.deleteEnergyCarrier,
        },
      },
      buildingMeasures: {
        name: "buildingMeasures",
        title: "Building renovation measures",
        info: documentation.buildingMeasures,
        isOpen: false,
        component: BuildingMeasuresCard,
        eventHandlers: {
          handleChange: this.handleChangeEvent,
          addBuildingMeasure: this.addBuildingMeasure,
          copyBuildingMeasure: this.copyBuildingMeasure,
          deleteBuildingMeasure: this.deleteBuildingMeasure,
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

  handleDropdownChange = (item: IDropdownAlt) => {
    if (item.path) {
      this.handleChange(this.formatPath(item.path), item.id);
    }
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

  setStateAndUpdate = (newState: ICalcDataPanelState) => {
    this.setState(newState);
    this.updateProjectDebounce();
  }

  // takes a subpath and returns its location in the main data structure
  formatPath = (childPath: string) => {
    return `project.calcData.${childPath}`;
  }

  handleFileUpload = (fileName: string, task: any) => {
    // todo: handle file input
  }

  handleCostCurveEdit = (costCurve: ICostCurve, costCurveId: string, activeEnergySystemId: string, costCurveScale: TCostCurveScale, costCurveType: TCostCurveCategory) => {
    let newState = { ...this.state };
    newState.project.calcData.energySystems[activeEnergySystemId].costCurves[costCurveScale][costCurveType][costCurveId] = costCurve;
    this.setStateAndUpdate(newState);
  }

  performDatabaseOperation = (checkValidOperation: (newState: ICalcDataPanelState) => boolean, operation: (newState: ICalcDataPanelState) => void) => {
    let newState = { ...this.state };
    if (!checkValidOperation(newState)) return;
    operation(newState); // we allow this operation to mutate the newState object
    this.setStateAndUpdate(newState);
  }

  // if id is supplied, attempt copying
  addBuildingType = (id: string = "") => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.buildingTypes).length >= config.MAX_BUILDING_TYPES) {
        AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDING_TYPES} building types are currently allowed`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      let buildingType;
      if (id) {
        const buildingTypeOriginal = newState.project.calcData.buildingTypes[id];
        if (!buildingTypeOriginal) {
          throw new Error(`Building type ${id} could not be found`);
        } 
        const copyName = `${buildingTypeOriginal.name} - copy`;
        buildingType = _cloneDeep(buildingTypeOriginal);
        buildingType.id = uuidv4();
        buildingType.name = copyName;
      } else {
        buildingType = new BuildingType();
      }

      for (const scenarioId in newState.project.scenarioData.scenarios) {
        const scenario = newState.project.scenarioData.scenarios[scenarioId];
        scenario.buildingTypes[buildingType.id] = new ScenarioInfo();
      } 

      newState.project.calcData.buildingTypes[buildingType.id] = buildingType;
    }
    this.performDatabaseOperation(valid, operation);
  }

  copyBuildingType = (id: string) => this.addBuildingType(id);

  // todo: actually delete it from the database (similar to deleting projects)
  deleteBuildingType = (id: string) => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.buildingTypes).filter(id => !newState.project.calcData.buildingTypes[id].deleted).length <= 1) {
        AppToaster.show({ intent: Intent.DANGER, message: `The last building type can not be deleted.`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      const buildingType = newState.project.calcData.buildingTypes[id];
      if (!buildingType) {
        throw new Error(`Building type ${id} could not be found`);
      }
      newState.project.calcData.buildingTypes[id].deleted = true;
    }
    this.performDatabaseOperation(valid, operation);
  }

  addEnergySystem = (id: string = "") => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.energySystems).length >= config.MAX_ENERGY_SYSTEMS) {
        AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_ENERGY_SYSTEMS} energy systems are currently allowed`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      let energySystem;
      if (id) {
        const energySystemOriginal = newState.project.calcData.energySystems[id];
        if (!energySystemOriginal) {
          throw new Error(`Energy system ${id} could not be found`);
        } 
        const copyName = `${energySystemOriginal.name} - copy`;
        energySystem = _cloneDeep(energySystemOriginal);
        energySystem.id = uuidv4();
        energySystem.name = copyName;
      } else {
        energySystem = new EnergySystem();
      }
      newState.project.calcData.energySystems[energySystem.id] = energySystem;
    }
    this.performDatabaseOperation(valid, operation);
  }

  copyEnergySystem = (id: string) => this.addEnergySystem(id);

  // todo: actually delete it from the database (similar to deleting projects)
  deleteEnergySystem = (id: string) => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.energySystems).filter(id => !newState.project.calcData.energySystems[id].deleted).length <= 1) {
        AppToaster.show({ intent: Intent.DANGER, message: `The last energy system can not be deleted.`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      const energySystem = newState.project.calcData.energySystems[id];
      if (!energySystem) {
        throw new Error(`Energy system ${id} could not be found`);
      }
      newState.project.calcData.energySystems[id].deleted = true;
    }
    this.performDatabaseOperation(valid, operation);
  }

  addEnergyCarrier = (id: string = "") => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.energyCarriers).length >= config.MAX_ENERGY_CARRIERS) {
        AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_ENERGY_CARRIERS} energy carriers are currently allowed`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      let energyCarrier;
      if (id) {
        const energyCarrierOriginal = newState.project.calcData.energyCarriers[id];
        if (!energyCarrierOriginal) {
          throw new Error(`Energy carrier ${id} could not be found`);
        } 
        const copyName = `${energyCarrierOriginal.name} - copy`;
        energyCarrier = _cloneDeep(energyCarrierOriginal);
        energyCarrier.id = uuidv4();
        energyCarrier.name = copyName;
      } else {
        energyCarrier = new EnergyCarrier();
      }
      newState.project.calcData.energyCarriers[energyCarrier.id] = energyCarrier;
    }
    this.performDatabaseOperation(valid, operation);
  }

  copyEnergyCarrier = (id: string) => this.addEnergyCarrier(id);

  // todo: actually delete it from the database (similar to deleting projects)
  deleteEnergyCarrier = (id: string) => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.energyCarriers).filter(id => !newState.project.calcData.energyCarriers[id].deleted).length <= 1) {
        AppToaster.show({ intent: Intent.DANGER, message: `The last energy carrier can not be deleted.`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      const energyCarrier = newState.project.calcData.energyCarriers[id];
      if (!energyCarrier) {
        throw new Error(`Energy carrier ${id} could not be found`);
      }
      newState.project.calcData.energyCarriers[id].deleted = true;
    }
    this.performDatabaseOperation(valid, operation);
  }

  addBuildingMeasure = (category: TBuildingMeasureCategory, id: string = "") => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.buildingMeasures[category]).length >= config.MAX_BUILDING_MEASURES) {
        AppToaster.show({ intent: Intent.DANGER, message: `Max ${config.MAX_BUILDING_MEASURES} building measures are currently allowed per category`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      let buildingMeasure;
      if (id) {
        const buildingMeasureOriginal = newState.project.calcData.buildingMeasures[category][id];
        if (!buildingMeasureOriginal) {
          throw new Error(`Energy carrier ${id} could not be found`);
        } 
        const copyName = `${buildingMeasureOriginal.measureName} - copy`;
        buildingMeasure = _cloneDeep(buildingMeasureOriginal);
        buildingMeasure.id = uuidv4();
        buildingMeasure.measureName = copyName;
      } else {
        buildingMeasure = this.getBuildingMeasure(category);
      }
      newState.project.calcData.buildingMeasures[category][buildingMeasure.id] = buildingMeasure;
    }
    this.performDatabaseOperation(valid, operation);
  }

  copyBuildingMeasure = (id: string, category: TBuildingMeasureCategory) => this.addBuildingMeasure(category, id);

  // todo: actually delete it from the database (similar to deleting projects)
  deleteBuildingMeasure = (id: string, category: TBuildingMeasureCategory) => {
    const valid = (newState: ICalcDataPanelState) => {
      if (Object.keys(newState.project.calcData.buildingMeasures[category]).filter(id => !newState.project.calcData.buildingMeasures[category][id].deleted).length <= 1) {
        AppToaster.show({ intent: Intent.DANGER, message: `The last building measure of each category can not be deleted.`});
        return false;
      }
      return true;
    }
    const operation = (newState: ICalcDataPanelState) => {
      const buildingMeasure = newState.project.calcData.buildingMeasures[category][id];
      if (!buildingMeasure) {
        throw new Error(`Building measure ${id} could not be found`);
      }
      newState.project.calcData.buildingMeasures[category][id].deleted = true;
    }
    this.performDatabaseOperation(valid, operation);
  }

  getBuildingMeasure(category: TBuildingMeasureCategory) {
    switch(category) {
      case "insulation":
        return new EnvelopeMeasure(category);
      case "hvac":
        return new HvacMeasure(category);
      case "windows":
        return new WindowMeasure(category);
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

  panelInfo = documentation.calcDataPanel;
  
  getInfoText = () => {
    return `# ${this.props.title}\n\n${this.panelInfo}\n\n${Object.keys(this.state.cards).map(cardId => {
      const card = this.state.cards[cardId];
      return `## ${card.title}\n\n${card.info??""}\n\n`
    }).join('')}`;
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
        <InfoButton level={1} label={this.props.title} info={this.getInfoText()}/>
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
                  <PanelCard component={card.component} data={data} project={this.state.project} {...card.eventHandlers} {...card.functions} />
                </Collapse>
              </Card>
            )
          })
        }
        <Dialog className="curve-editor-dialog cost-curve-editor-dialog" isOpen={this.state.costCurveEditorIsOpen} onClose={this.closeEditCostCurve} >
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