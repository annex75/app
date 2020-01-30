import React, { Component } from 'react';

import { IResultsPanelProps, IResultsPanelState } from '../../types';

export class ResultsPanel extends Component<IResultsPanelProps, IResultsPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card panel-card">Graph output</div>
                <div className="bp3-card panel-card">Tabulated results</div>
            </div>
        )
    }
}