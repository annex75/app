import React, { Component } from 'react';
import { IOverviewPanelProps, IOverviewPanelState } from '../types';
import { ICalcDataPanelProps, ICalcDataPanelState } from '../types';
import { IScenariosPanelProps, IScenariosPanelState } from '../types';
import { IModelPanelProps, IModelPanelState } from '../types';
import { IResultsPanelProps, IResultsPanelState } from '../types';

const panelCardStyles = {
    //maxWidth: "30%",
    minWidth: "150px",
    flex: "1",
    margin: "5px",

}

export class OverviewPanel extends Component<IOverviewPanelProps, IOverviewPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card" style={panelCardStyles}>Assessment information</div>
                <div className="bp3-card" style={panelCardStyles}>Location</div>
                <div className="bp3-card" style={panelCardStyles}>Results overview</div>
                <div className="bp3-card" style={panelCardStyles}>About Annex 75</div>
            </div>
        )
    }
}

export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card" style={panelCardStyles}>District</div>
                <div className="bp3-card" style={panelCardStyles}>Building types</div>
                <div className="bp3-card" style={panelCardStyles}>Energy systems</div>
                <div className="bp3-card" style={panelCardStyles}>Building efficiency measures</div>
            </div>
        )
    }
}

export class ScenariosPanel extends Component<IScenariosPanelProps, IScenariosPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
            </div>
        )
    }
}

export class ModelPanel extends Component<IModelPanelProps, IModelPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card" style={panelCardStyles}>Energy demand</div>
                <div className="bp3-card" style={panelCardStyles}>Energy system output</div>
                <div className="bp3-card" style={panelCardStyles}>Energy system cost</div>
            </div>
        )
    }
}

export class ResultsPanel extends Component<IResultsPanelProps, IResultsPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card" style={panelCardStyles}>Graph output</div>
                <div className="bp3-card" style={panelCardStyles}>Tabulated results</div>
            </div>
        )
    }
}