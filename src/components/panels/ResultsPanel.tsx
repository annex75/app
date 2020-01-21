import React, { Component } from 'react';
import { panelCardStyles } from '../../style/stylesheet';

import { IResultsPanelProps, IResultsPanelState } from '../../types';

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