import React, { Component } from 'react';

import { ICalcDataPanelProps, ICalcDataPanelState } from '../../types';

export class CalcDataPanel extends Component<ICalcDataPanelProps, ICalcDataPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card panel-card">District</div>
                <div className="bp3-card panel-card">Building types</div>
                <div className="bp3-card panel-card">Energy systems</div>
                <div className="bp3-card panel-card">Building efficiency measures</div>
            </div>
        )
    }
}