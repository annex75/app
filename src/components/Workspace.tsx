import React, { Component, ChangeEvent } from 'react';
import { Breadcrumb } from '@blueprintjs/core';
import { IWorkspaceState, IWorkspaceProps } from '../types/index';

export class Workspace extends Component<IWorkspaceProps, IWorkspaceState> {
    handleChange = (e:ChangeEvent<HTMLTextAreaElement>) => {
        const project = { ...this.props.item };
        project.value = e.target.value;
        this.props.updateProject(project);
    }

    formatValue = () => {
        return { __html: `The value in the text box is "${this.props.item.value}"` };
    }

    render() {
        const { item: project } = this.props;
        return (
            <div>
                <ul className="bp3-breadcrumbs">
                    <li><Breadcrumb href="/project" text="Projects"/></li>
                    <li><Breadcrumb href="#" text={project.id}/></li>
                </ul>
                <h2 style={{margin: "0.5em 0"}}>{project.id}</h2>
                <div className="workspace">
                    <div className="panel">
                        <h3>Input</h3>
                        <textarea
                            style={{width: "100%", height:"100%"}}
                            onChange={this.handleChange}
                            value={project.value} />
                    </div>
                    <div className="panel">
                        <h3>Output</h3>
                        <div
                            style={{width: "100%", height:"100%", fontFamily: "monospace"}}
                            className="workspace-output"
                            dangerouslySetInnerHTML={this.formatValue()}/>
                    </div>
                </div>
            </div>
        );
    }
}