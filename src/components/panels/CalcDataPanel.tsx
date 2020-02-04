import React, { Component, ChangeEvent } from 'react';

import { set as _fpSet } from 'lodash/fp';
import { Collapse, Button, Card } from '@blueprintjs/core';

//import { CalcData } from '@annex-75/calculation-model/';

import { ICalcDataPanelProps, ICalcDataPanelState, IDictComponentType, CalcData, IDictDictEventHandler, Building, ICalcDataCardProps } from '../../types';
import { DistrictCard } from './cards/DistrictCard';
import { BuildingCard } from './cards/BuildingCard';


export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {
    
    constructor(props: ICalcDataPanelProps) {
        super(props);
        this.state = {
            project: props.project,
            cards: {
                district: {
                    name: "district",
                    title: "District",
                    isOpen: false,
                },
                buildings: {
                    name: "buildings",
                    title: "Buildings",
                    isOpen: false,
                },
                energySystems: {
                    name: "energySystems",
                    title: "Energy systems",
                    isOpen: false,
                },
                buildingMeasures: {
                    name: "buildingMeasures",
                    title: "Building renovation measures",
                    isOpen: false,
                },
            }
        }
    }
    
    handleClick = (e:React.MouseEvent<HTMLElement>, name: string) => {
        let newState = { ...this.state };
        newState.cards[name].isOpen = !newState.cards[name].isOpen;
        this.setState(newState);
    }

    handleChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    addBuilding = () => {
        const building = new Building();
        let newState = { ...this.state };

        // hack: annoyingly we can't store empty objects in firebase so we need to check if the buildings key exists
        newState.project.calcData.buildings = newState.project.calcData.buildings || {};
        newState.project.calcData.buildings[building.id] = building;
        this.setState(newState);
        this.props.updateProject(newState.project);
    }    

    // todo: hmm doesn't look very robust to hard code this. but how can we else keep the order when iterating using map?
   cardsInOrder = [
        "district",
        "buildings",
        "energySystems",
        "buildingMeasures",
    ]
    
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                { 
                    this.cardsInOrder.map( id => {
                        const card = this.state.cards[id];
                        const data = this.state.project.calcData[id as keyof CalcData];
                        return (
                            <Card key={`${id}-card`} id={`${id}-card`} elevation={card.isOpen? 2: 0} className="panel-card">    
                                <div className="panel-card-header">
                                    <h3 style={{flexGrow: 1}}>{card.title}</h3>    
                                    <Button minimal className="bp3-button" icon={card.isOpen? "arrow-up": "arrow-down"} onClick={(e:React.MouseEvent<HTMLElement>) => this.handleClick(e, id)}>
                                        
                                    </Button>
                                </div>
                                <Collapse key={`${id}-collapse`} isOpen={card.isOpen}>
                                    <PanelCard component={this.cardComponents[id]} data={data} {...this.cardEventHandlers[id]}/>
                                </Collapse>
                            </Card>
                        )
                    })
                }
            </div>
        )
    }

    cardComponents: IDictComponentType = {
        district: DistrictCard,
        buildings: BuildingCard,
        energySystems: EnergySystemsCard,
        buildingMeasures: BuildingMeasuresCard,
    }

    // todo: this is getting a bit messy, maybe refactor
    cardEventHandlers: IDictDictEventHandler = {
        district: { 
            handleChange: this.handleChange,
            handleFileInput: this.handleFileInput,
        },
        buildings: {
            handleChange: this.handleChange,
            addBuilding: this.addBuilding,
        },
        energySystems: {
            handleChange: this.handleChange,
        },
        buildingMeasures: {
            handleChange: this.handleChange,
        }
    }
}

const PanelCard = ({component: Component, ...rest}: any) => {
    return <Component {...rest}/>
}

const EnergySystemsCard = (props: ICalcDataCardProps) => {
    const energySystems = props.data;
    return (
        <div>{energySystems}</div>
    )
}
    
const BuildingMeasuresCard = (props: ICalcDataCardProps) => {
    const buildingMeasures = props.data;
    return (
        <div>{buildingMeasures}</div>
    )
}