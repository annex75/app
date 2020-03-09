import React, { Component, ChangeEvent, FormEvent } from 'react';

import { IOverviewPanelProps, IOverviewPanelState, IOverviewDataCard } from '../../types';
import { TextArea, FormGroup, InputGroup, /*NumericInput,*/ Tooltip } from '@blueprintjs/core';

import { set as _fpSet, get as _fpGet } from 'lodash/fp';
import { ScatterChart, CartesianGrid, XAxis, YAxis, Scatter } from 'recharts';
import { strings } from '../../constants/textData';

export class OverviewPanel extends Component<IOverviewPanelProps, IOverviewPanelState> {

  constructor(props: IOverviewPanelProps) {
    super(props);
    const overviewDataCards: Record<string,IOverviewDataCard> = {
      assessmentInfo: {
        name: "assessmentInfo",
        title: "Assessment info",
        isOpen: false,
        eventHandlers: { handleChange: this.handleChange },
        parameters: {
          name: {
            type: String,
            label: "Name:",
            path: "project.overviewData.contactInfo.name",
          },
          email: {
            type: String,
            label: "E-mail:",
            path: "project.overviewData.contactInfo.email",
          },
          affiliation: {
            type: String,
            label: "Affiliation:",
            path: "project.overviewData.contactInfo.affiliation",
          },
          //todo: make this a list instead of just a text area
          toolsUsed: {
            type: String,
            label: "Tools used:",
            path: "project.overviewData.toolsInfo",
          }
        }
      },
      locationInfo: {
        name: "locationInfo",
        title: "Location info",
        isOpen: false,
        eventHandlers: { handleChange: this.handleChange },
        parameters: {
          country: {
            disabled: true,
            type: String,
            label: "Country:",
            path: "project.calcData.district.location.country.country",
          },
          place: {
            disabled: true,
            type: String,
            label: "City:",
            path: "project.calcData.district.location.place",
          },
          latitude: {
            disabled: true,
            type: String,
            label: "Latitude:",
            path: "project.calcData.district.location.lat",
          },
          longitude: {
            disabled: true,
            type: String,
            label: "Longitude:",
            path: "project.calcData.district.location.lon",
          }
        }
      }
    }
    this.state = {
      project: props.project,
      overviewDataCards
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newState = _fpSet(e.target.name, e.target.value, this.state);
    this.setState(newState);
    this.props.updateProject(newState.project);
  }

  handleInput = (e: FormEvent<HTMLInputElement>) => {
    console.log(e);
  }

  chartSettings = {
    width: 400,
    height: 200,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  }

  placeholderData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
  ]

  renderInputField = (param: any, paramId: string) => {
    const val = _fpGet(param.path, this.state) as string;
    switch(param.type) {
      case Number:
        //todo: we can't handle numeric inputs here yet!
        // return (
        //<NumericInput 
        //    name="project.overviewData.location.lat"
        //    id="lat-input"
        //    min={-90}
        //    max={90}
        //    onValueChange={ (n, s, e) => { this.handleChange(e) }}
        //    value={project.calcData.district.location.lat}/>
        //)
      case String:
        return (
          <InputGroup
            disabled={param.disabled || false}
            key={`overview-${paramId}-input`}
            name={param.path}
            id={`overview-${paramId}-input`}
            onChange={this.handleChange}
            value={val} />
        )
      default:
        throw Error(`this data type: ${param.type} has not been defined`);
    }
  }

  render() {
    const { project } = this.state;
    return (
      <div>
        <h1>{this.props.title}</h1>
        {
          Object.keys(this.state.overviewDataCards).map(cardId => {
            const card = this.state.overviewDataCards[cardId];
            return (
              <div className="bp3-card panel-card" id={`overview-data-${cardId}-card`} key={`overview-data-${cardId}-card`}>
                <h2>{card.title}</h2>
                {
                  Object.keys(card.parameters).map(paramId => {
                    const param = card.parameters[paramId];
                    return (
                      <FormGroup
                        inline
                        className="inline-input"
                        key={`overview-${paramId}-input`}
                        label={param.label}
                        labelFor={`overview-${paramId}-input`}>
                        {
                          this.renderInputField(param, paramId)
                        }
                      </FormGroup>
                    )
                  })
                }  
              </div>
            )
          })
        }
        
        <div id="results-overview" className="bp3-card panel-card">
          <h2>Results overview (placeholder)</h2>
          <ScatterChart {...this.chartSettings}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="x" unit="-" />
            <YAxis type="number" dataKey="y" name="y" unit="-" />
            {/* todo: Tooltip does not seem to do anything */}
            <Tooltip />
            <Scatter name="Placeholder data" data={this.placeholderData} fill="#8884d8" />

          </ScatterChart>
        </div>

        <div id="about-project" className="bp3-card panel-card">
          <h2>About Annex 75</h2>
          <p>{strings.aboutAnnex75.en}</p>
        </div>
      </div>
    )
  }
}