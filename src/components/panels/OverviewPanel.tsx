import React, { Component, ChangeEvent } from 'react';
import { panelCardStyles } from '../../style/stylesheet';

import { IOverviewPanelProps, IOverviewPanelState } from '../../types';
import { TextArea, FormGroup } from '@blueprintjs/core';

export class OverviewPanel extends Component<IOverviewPanelProps, IOverviewPanelState> {

    constructor(props: IOverviewPanelProps) {
        super(props);
        this.state = {
            project: props.project,
        }

    }

    handleChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const project = { ...this.state.project };
        project.overviewData = {
            ...project.overviewData,
            [e.target.name]: e.target.value
        }
        // todo: not sure why I need to setState here but it doesn't work otherwise
        this.setState({ project });
        this.props.updateProject(project);
    }

    render() {
        const { project } = this.state;
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div className="bp3-card" style={panelCardStyles}>
                    <h2>Assessment information</h2>
                    <FormGroup
                        label="Contact info"
                        labelFor="contact-info"
                    >
                        <TextArea
                            fill
                            id="contact-info"
                            name="contactInfo"
                            onChange={this.handleChange}
                            value={project.overviewData.contactInfo} />    
                    </FormGroup>

                    <FormGroup
                        label="Tools used"
                        labelFor="tools-info"
                    >
                        <TextArea
                            fill
                            id="tools-info"
                            name="toolsInfo"
                            onChange={this.handleChange}
                            value={project.overviewData.toolsInfo} />    
                    </FormGroup>
                    
                </div>
                <div className="bp3-card" style={panelCardStyles}>Location</div>
                <div className="bp3-card" style={panelCardStyles}>Results overview</div>
                <div className="bp3-card" style={panelCardStyles}>About Annex 75</div>
            </div>
        )
    }
}