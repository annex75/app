import React, { Component } from 'react';
import { panelCardStyles } from '../../style/stylesheet';

import { IModelPanelProps, IModelPanelState } from '../../types';

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