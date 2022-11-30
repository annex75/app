// external
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import { Collapse, Button, Card } from "@blueprintjs/core";

// internal
import { ILandingPageProps, ILandingPageState } from '../types';

type TDropdownKind = "changelog" | "gettingStarted"

export class LandingPage extends Component<ILandingPageProps, ILandingPageState> {
  constructor(props: ILandingPageProps) {
    super(props);
    this.state = {
      open: {
        changelog: false,
        gettingStarted: false,
      }
    }
  }

  handleExpandClick = (e: React.MouseEvent<HTMLElement>, kind: TDropdownKind) => {
    let newState = { ...this.state };
    newState.open[kind] = !newState.open[kind];
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <Card key={`info-card`} id={`info-card`} elevation={0} className="panel-card bp3-elevation-0">
          <h1>IEA EBC Annex 75 - Cost-effective Building Renovation at District Level Combining Energy Efficiency & Renewables</h1>
          <p>Buildings are a major source of carbon emissions and cost-effectively reducing their energy use and associated emissions is particularly challenging for the existing building stock, mainly because of the existence of many architectural and technical hurdles. The transformation of existing buildings into low-emission and low-energy buildings is particularly challenging in cities, where many buildings continue to rely too much on heat supply by fossil fuels.</p>
        </Card>
        <Card key={`getting-started-card`} id={`getting-started-card`} elevation={this.state.open.gettingStarted ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
          <div className="panel-card-header" onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandClick(e, "gettingStarted")}>
            <h3 style={{ flexGrow: 1 }}>Getting started</h3>
            <Button minimal className="bp3-button" icon={this.state.open.gettingStarted ? "arrow-up" : "arrow-down"}/>
          </div>
          <Collapse key={`getting-started-collapse`} isOpen={this.state.open.gettingStarted}>
            <ReactMarkdown 
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              children={this.props.gettingStarted}/>
          </Collapse>
        </Card>
        <Card key={`changelog-card`} id={`changelog-card`} elevation={this.state.open.changelog ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
          <div className="panel-card-header" onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandClick(e, "changelog")}>
            <h3 style={{ flexGrow: 1 }}>Changelog</h3>
            <Button minimal className="bp3-button" icon={this.state.open.changelog ? "arrow-up" : "arrow-down"}/>
          </div>
          <Collapse key={`changelog-collapse`} isOpen={this.state.open.changelog}>
            <ReactMarkdown children={this.props.changelog}/>
          </Collapse>
        </Card>
      </div>
    )
  }

}