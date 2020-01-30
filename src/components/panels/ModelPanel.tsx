import React, { Component } from 'react';

import { IModelPanelProps, IModelPanelState } from '../../types';

export class ModelPanel extends Component<IModelPanelProps, IModelPanelState> {
    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card panel-card" >Energy demand</div>
                <div className="bp3-card panel-card" >Energy system output</div>
                <div className="bp3-card panel-card" >Energy system cost</div>
            </div>
        )
    }
}