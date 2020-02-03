import React, { Component } from 'react';

import { Collapse, Button, Card } from '@blueprintjs/core';

//import { CalcData } from '@annex-75/calculation-model/';

import { ICalcDataPanelProps, ICalcDataPanelState, IDictComponentType, CalcData } from '../../types';

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

    // todo: hmm doesn't look very robust to hard code this. but how can we else keep the order when iterating using map?
    renderOrder = [
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
                    this.renderOrder.map( id => {
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
                                    <PanelCard component={this.cardComponents[id]} data={data}/>
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

}

interface ICalcDataCardProps {
    data:string;
}

const PanelCard = ({component: Component, ...rest}: any) => {
    return <Component {...rest}/>
}

interface IDistrictCardProps extends ICalcDataCardProps {

}

class DistrictCard extends Component<IDistrictCardProps> {

    render() {
        return (
            <div>{this.props.data}</div>
        )
    }
}

class BuildingCard extends Component<ICalcDataCardProps> {
    render() {
        return (
            <div>{this.props.data}</div>
        )
    }
}

class EnergySystemsCard extends Component<ICalcDataCardProps> {
    render() {
        return (
            <div>{this.props.data}</div>
        )
    }
}
    
class BuildingMeasuresCard extends Component<ICalcDataCardProps> {
    render() {
        return (
            <div>{this.props.data}</div>
        )
    }
}