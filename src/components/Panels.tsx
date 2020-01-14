import React, { Component } from 'react';
import { IOverviewPanelProps, IOverviewPanelState } from '../types';
import { ICalcDataPanelProps, ICalcDataPanelState } from '../types';
import { IScenariosPanelProps, IScenariosPanelState } from '../types';
import { IModelPanelProps, IModelPanelState } from '../types';
import { IResultsPanelProps, IResultsPanelState } from '../types';

export class OverviewPanel extends Component<IOverviewPanelProps, IOverviewPanelState> {
    render() {
        return <h1>Hello world! This is the {this.props.title}...</h1>
    }
}

export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {
    render() {
        return <h1>Hello world! This is the {this.props.title}...</h1>
    }
}

export class ScenariosPanel extends Component<IScenariosPanelProps, IScenariosPanelState> {
    render() {
        return <h1>Hello world! This is the {this.props.title}...</h1>
    }
}

export class ModelPanel extends Component<IModelPanelProps, IModelPanelState> {
    render() {
        return <h1>Hello world! This is the {this.props.title}...</h1>
    }
}

export class ResultsPanel extends Component<IResultsPanelProps, IResultsPanelState> {
    render() {
        return <h1>Hello world! This is the {this.props.title}...</h1>
    }
}