import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { NewProjectForm } from './NewProjectForm';
import { IHeaderProps, IHeaderState, IUserInfoProps, IUserInfoState } from '../types';

export class Header extends Component<IHeaderProps, IHeaderState> {
  constructor(props: IHeaderProps) {
    super(props);
    this.state = {
      projectPopoverOpen: false,
      userPopoverOpen: false,
    }
  }

  closeProjectPopover = () => {
    this.setState({
      projectPopoverOpen: false,
    });
  }

  /*
  closeUserPopover = () => {
      this.setState({
          userPopoverOpen: false,
      });
  }
  */

  render() {
    return (
      <nav className="bp3-navbar" style={{}}>
        <div className="bp3-navbar-group bp3-align-left">
          <Link className="bp3-button bp3-minimal bp3-navbar-heading" to="/">Annex 75 Calculation Tool</Link>
          {
            this.props.authenticated
              ? <input disabled className="bp3-input" placeholder="Search projects..." type="text" />
              : null
          }
        </div>
        {
          this.props.authenticated ?
            (
              <div className="bp3-navbar-group bp3-align-right">
                <Link className="bp3-button bp3-minimal bp3-icon-database" to="/projects">Projects</Link>
                <Popover
                  content={(<NewProjectForm addProject={this.props.addProject} postSubmitHandler={this.closeProjectPopover} />)}
                  interactionKind={PopoverInteractionKind.CLICK}
                  isOpen={this.state.projectPopoverOpen}
                  onInteraction={(state) => this.setState({ projectPopoverOpen: state })}
                  position={Position.BOTTOM}>
                  <button className="bp3-button bp3-minimal bp3-icon-add" aria-label="add new project"></button>
                </Popover>
                <span className="bp3-navbar-divider"></span>
                <Popover
                  content={(<UserInfo userData={this.props.userData} />)}
                  interactionKind={PopoverInteractionKind.CLICK}
                  isOpen={this.state.userPopoverOpen}
                  onInteraction={(state) => this.setState({ userPopoverOpen: state })}
                  position={Position.BOTTOM}>
                  <button className="bp3-button bp3-minimal bp3-icon-user" aria-label="add new project"></button>
                </Popover>
                <Button minimal disabled icon="cog"></Button>
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

class UserInfo extends Component<IUserInfoProps, IUserInfoState> {
  render() {
    return <h3 style={{ padding: "1em" }}>Current user: {this.props.userData!.email}</h3>
  }
}