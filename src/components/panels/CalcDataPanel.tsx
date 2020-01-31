import React, { Component } from 'react';

import { Collapse, Button, Card } from '@blueprintjs/core';

//import { CalcData } from '@annex-75/calculation-model/';

import { ICalcDataPanelProps, ICalcDataPanelState, IDictComponentType } from '../../types';

export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {
    
    constructor(props: ICalcDataPanelProps) {
        super(props);
        this.state = {
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
    
    render() {
        const cardIds = Object.keys(this.state.cards);
        return (
            <div>
                <h1>{this.props.title}</h1>
                { 
                    cardIds.map( id => {
                        const card = this.state.cards[id];
                        return (
                            <Card id={id} elevation={card.isOpen? 2: 0} className="panel-card">    
                                <div className="panel-card-header">
                                    <h3 style={{flexGrow: 1}}>{card.title}</h3>    
                                    <Button minimal className="bp3-button" icon={card.isOpen? "arrow-up": "arrow-down"} onClick={(e:React.MouseEvent<HTMLElement>) => this.handleClick(e, id)}>
                                        
                                    </Button>
                                </div>
                                <Collapse isOpen={card.isOpen}>
                                    <PanelCard component={this.cardComponents[id]}/>
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

const PanelCard = ({component: Component}: any) => {
    return <Component/>
}

class DistrictCard extends Component {
    render() {
        return (
            <div>Hello world!</div>
        )
    }
}

class BuildingCard extends Component {
    render() {
        return (
            <div>Hello building!</div>
        )
    }
}

class EnergySystemsCard extends Component {
    render() {
        return (
            <div>Hello energy!</div>
        )
    }
}
    
class BuildingMeasuresCard extends Component {
    render() {
        return (
            <div>Hello measure!</div>
        )
    }
}