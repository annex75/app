import React, { Component, ChangeEvent } from 'react';
import { IWorkspaceState, IWorkspaceProps } from '../types/index';

export class Workspace extends Component<IWorkspaceProps, IWorkspaceState> {
    constructor (props:IWorkspaceProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (e:ChangeEvent<HTMLTextAreaElement>) => {
        const data = { ...this.props.data };
        data.value = e.target.value;
        this.props.updateData(data);
    }

    formatValue = () => {
        return { __html: `The value in the text box is "${this.props.data.value}"` };
    }

    render() {
        return (
            <div className="workspace">
                <div className="panel">
                    <h3>Input</h3>
                    <textarea
                        style={{width: "100%", height:"100%"}}
                        onChange={this.handleChange}
                        value={this.props.data.value} />
                </div>
                <div className="panel">
                    <h3>Output</h3>
                    <div
                        style={{width: "100%", height:"100%", fontFamily: "monospace"}}
                        className="workspace-output"
                        dangerouslySetInnerHTML={this.formatValue()}/>
                </div>
            </div>
        );
    }
}