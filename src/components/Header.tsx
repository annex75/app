import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { NewProjectForm } from './NewProjectForm';
import { IHeaderProps, IHeaderState } from '../types'

export class Header extends Component<IHeaderProps, IHeaderState> {
    constructor(props: IHeaderProps) {
        super(props);
        this.state = {
            popoverOpen: false,
        }
    }
    
    closePopover = () => {
        this.setState({
            popoverOpen: false,
        })
    }

    render() {
        return (
            <nav className="bp3-navbar">
                <div className="bp3-navbar-group bp3-align-left">
                    <div className="bp3-navbar-heading">Annex 75 Calculation Tool</div>
                    { 
                        this.props.authenticated
                        ? <input className="bp3-input" placeholder="Search data..." type="text"/>
                        : null 
                    }
                </div>
                {
                    this.props.authenticated?
                    (
                        <div className="bp3-navbar-group bp3-align-right">
                        <Link className="bp3-button bp3-minimal bp3-icon-database" to="/projects">Projects</Link>
                        <Popover
                            content={(<NewProjectForm addProject={this.props.addProject} postSubmitHandler={this.closePopover}/>)}
                            interactionKind={PopoverInteractionKind.CLICK}
                            isOpen={this.state.popoverOpen}
                            onInteraction={(state) => this.setState({ popoverOpen: state })}
                            position={Position.BOTTOM}>
                            <button className="bp3-button bp3-minimal bp3-icon-add" aria-label="add new project"></button>
                        </Popover>
                        <span className="bp3-navbar-divider"></span>
                        <Button minimal icon="user"></Button>
                        <Button minimal icon="cog"></Button>
                        <Link className="bp3-button bp3-minimal bp3-icon-log-out" to="/logout" aria-label="Log Out"></Link>
                        </div>
                    )
                    : (
                        <div className="bp3-navbar-group bp3-align-right">
                            <Link className="bp3-button bp3-intent-primary" to="/login">Register/Login</Link>
                        </div>
                    )
                }
            </nav>
        );
    }
}