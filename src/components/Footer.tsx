import React, { Component } from 'react';
import { IFooterState, IFooterProps } from '../types';
import { Button, AnchorButton, Popover, PopoverInteractionKind, Position, Dialog } from '@blueprintjs/core';
import { strings } from '../constants/textData'
import { secureLink } from '../helpers';
import { APP_VERSION } from '../constants';
import { PrivacyPolicy } from './PrivacyPolicy';

export class Footer extends Component<IFooterProps, IFooterState> {
  constructor(props: IFooterProps) {
    super(props);
    this.state = { 
      year: new Date().getFullYear(),
      helpPopoverOpen: false,
      privacyDialogOpen: false,
    };
  }
  render() {
    return (
      <nav className="bp3-navbar bp3-align-right" style={{ display: "flex", flexDirection: "row" }}>
        <div className="bp3-navbar-group bp3-align-left">
          <AnchorButton icon="link" className="bp3-button bp3-minimal" href="http://annex75.iea-ebc.org/about" target="_blank">About IEA EBC Annex 75</AnchorButton>
          <Popover
            content={
              <HelpPopoverContent/>
            }
            interactionKind={PopoverInteractionKind.CLICK}
            isOpen={this.state.helpPopoverOpen}
            onInteraction={(state) => this.setState({ helpPopoverOpen: state })}
            position={Position.TOP}>
            <Button title="About" minimal icon="help" aria-label="help"></Button>
          </Popover>
          <Dialog isOpen={this.state.privacyDialogOpen} className="gdpr-dialog">
            <PrivacyPolicy/>
            <Button className="gdpr-dialog-button" onClick={() => this.setState({privacyDialogOpen: false})}>Close</Button>
          </Dialog>
          <Button
            title="Privacy"
            onClick={() => this.setState({privacyDialogOpen: true})}
            minimal icon="shield" aria-label="shield"/>          
        </div>
        
        <div className="bp3-navbar-group bp3-align-right" style={{ display: "flex", alignItems: "flex-end", flex: "1 1 auto" }}>
          <ul className="site-link bp3-align-right" style={{ flex: "1 1 auto", paddingInlineEnd: "1em", textAlign: "right", }}>
            <li style={{ display: "inline", }}>
              &copy; {this.state.year} StruSoft AB
            </li>
          </ul>
          <div className="bp3-align-right" style={{}}>
            <a href="https://www.iea-ebc.org/">
              <img className="bp3-align-right footer-ebc-logo" src="ebc_logo.png" alt="EBC Logo" />
            </a>
          </div>
        </div>
      </nav>
    );
  }
}

const HelpPopoverContent = () => {
  return (
    <div className="help-popover-content">
      This application is developed as part of the IEA EBC Annex 75 project.
      <br/>The source code is available on {secureLink(strings.githubLink, "GitHub")}
      <br/>For support, please contact {secureLink(`mailto:${strings.supportEMail}`, strings.supportEMail)}
      <br/>App version: {APP_VERSION}
    </div>
  )
}
