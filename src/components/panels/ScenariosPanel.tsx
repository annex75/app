import React, { Component } from 'react';
import { panelCardStyles } from '../../style/stylesheet';

import { IScenariosPanelProps, IScenariosPanelState } from '../../types';

export class ScenariosPanel extends Component<IScenariosPanelProps, IScenariosPanelState> {
    render() {
        return (
            <div>
                <div className="bp3-card" style={panelCardStyles}>{this.props.title}</div>
            </div>
        )
    }
}