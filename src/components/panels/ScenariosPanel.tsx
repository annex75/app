import React, { Component } from 'react';

import { IScenariosPanelProps, IScenariosPanelState } from '../../types';

export class ScenariosPanel extends Component<IScenariosPanelProps, IScenariosPanelState> {
    render() {
        return (
            <div>
                <div className="bp3-card panel-card">{this.props.title}</div>
            </div>
        )
    }
}