// external
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import { Collapse, Button, Card } from "@blueprintjs/core";

// internal
import { ILandingPageProps, ILandingPageState } from '../types';

export class LandingPage extends Component<ILandingPageProps, ILandingPageState> {
  constructor(props: ILandingPageProps) {
    super(props);
    this.state = {
      changelogOpen: false,
    }
  }

  handleExpandChangelogClick = (e: React.MouseEvent<HTMLElement>) => {
    let newState = { ...this.state };
    newState.changelogOpen = !newState.changelogOpen;
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <Card key={`info-card`} id={`info-card`} elevation={0} className="panel-card bp3-elevation-0">
          <h1>IEA EBC Annex 75 - Cost-effective Building Renovation at District Level Combining Energy Efficiency & Renewables</h1>
          <p>Buildings are a major source of greenhouse gas emissions and cost-effectively reducing their energy use and associated emissions is particularly challenging for the existing building stock, mainly because of the existence of many architectural and technical hurdles. The transformation of existing buildings into low-emission and low-energy buildings is particularly challenging in cities, where many buildings continue to rely too much on heat supply by fossil fuels.</p>
        </Card>
        <Card key={`changelog-card`} id={`changelog-card`} elevation={this.state.changelogOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
          <div className="panel-card-header" onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandChangelogClick(e)}>
            <h3 style={{ flexGrow: 1 }}>Changelog</h3>
            <Button minimal className="bp3-button" icon={this.state.changelogOpen ? "arrow-up" : "arrow-down"}/>
          </div>
          <Collapse key={`changelog-collapse`} isOpen={this.state.changelogOpen}>
            <ReactMarkdown children={this.props.changelog}/>
          </Collapse>
        </Card>
      </div>
    )
  }

}