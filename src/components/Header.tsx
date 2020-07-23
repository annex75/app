import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { IHeaderProps, IHeaderState, IUserInfoProps, IUserInfoState } from '../types';

export class Header extends Component<IHeaderProps, IHeaderState> {
  constructor(props: IHeaderProps) {
    super(props);
    this.state = {
      userPopoverOpen: false,
    }
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
      <nav className="bp3-navbar header-navbar">
        <div className="bp3-navbar-group bp3-align-left">
          <Link className="bp3-button bp3-minimal bp3-navbar-heading" to="/" onClick={() => this.props.exitProject()}>Annex 75 Calculation Tool</Link>
        </div> {
          this.props.authenticated? (
              <div className="bp3-navbar-group bp3-align-right"> {
                  
                  this.props.activeProject? (
                    <>
                      <h6 className="header-reminder-text">Project last saved: {(() => {
                        const date = new Date(this.props.activeProject!.timeStamp);
                        const dateString = date.toUTCString();
                        return dateString;
                      })()}</h6>
                      <span className="bp3-navbar-divider"></span>
                    </>
                  ) : null
                }
                <Link className="bp3-button bp3-minimal bp3-icon-database" to="/projects" onClick={() => this.props.exitProject()}>Projects</Link>
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
            ) : (
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
    return <div className="user-info-content">Current user: {this.props.userData!.email}</div>
  }
}