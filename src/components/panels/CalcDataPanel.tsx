import React, { Component } from 'react';
import { panelCardStyles } from '../../style/stylesheet';

import { ICalcDataPanelProps, ICalcDataPanelState } from '../../types';

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