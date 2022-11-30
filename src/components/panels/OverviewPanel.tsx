// external
import React, { Component, ChangeEvent, FormEvent } from 'react';
import { set as _fpSet, equals as _fpEquals } from 'lodash/fp';
import { debounce as _debounce } from 'lodash';
/* import { ScatterChart, CartesianGrid, XAxis, YAxis, Scatter } from 'recharts'; */
import { FormGroup, /* Tooltip */ } from '@blueprintjs/core';

// internal
import { IOverviewPanelProps, IOverviewPanelState, IOverviewDataCard } from '../../types';
import { renderInputField, renderInputLabel, InfoButton } from '../../helpers';
import { strings, documentation } from '../../constants/textData';

export class OverviewPanel extends Component<IOverviewPanelProps, IOverviewPanelState> {

  constructor(props: IOverviewPanelProps) {
    super(props);
    const overviewDataCards: Record<string,IOverviewDataCard> = {
      assessmentInfo: {
        name: "assessmentInfo",
        title: "Assessment information",
        info: documentation.assessmentInfo,
        isOpen: false,
        eventHandlers: { handleChange: this.handleChange },
        parameters: {
          name: {
            key: "name",
            type: String,
            label: "Name",
            info: "Person responsible for assessment",
            path: "project.overviewData.contactInfo.name",
          },
          email: {
            key: "email",
            type: String,
            label: "E-mail",
            path: "project.overviewData.contactInfo.email",
          },
          phone: {
            key: "phone",
            type: String,
            label: "Telephone number",
            path: "project.overviewData.contactInfo.phone",
          },
          affiliation: {
            key: "affiliation",
            type: String,
            label: "Affiliation/Organisation",
            path: "project.overviewData.contactInfo.affiliation",
          },
          //todo: make this a list instead of just a text area
          toolsUsed: {
            key: "toolsUsed",
            type: String,
            label: "Tools used",
            info: "(For reference purposes) what external tools were used for simulations and calculations",
            path: "project.overviewData.toolsInfo",
          }
        }
      },
      locationInfo: {
        name: "locationInfo",
        title: "Location information",
        info: documentation.locationInfo,
        isOpen: false,
        eventHandlers: { handleChange: this.handleChange },
        parameters: {
          country: {
            key: "country",
            disabled: true,
            type: String,
            label: "Country",
            path: "project.calcData.district.location.country.country",
          },
          place: {
            key: "place",
            disabled: true,
            type: String,
            label: "City",
            path: "project.calcData.district.location.place",
          },
          latitude: {
            key: "latitude",
            disabled: true,
            type: String,
            label: "Latitude",
            path: "project.calcData.district.location.lat",
          },
          longitude: {
            key: "longitude",
            disabled: true,
            type: String,
            label: "Longitude",
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

  componentDidUpdate(prevProps: IOverviewPanelProps) {
    if (!_fpEquals(prevProps, this.props)) {
      this.setState({ project: this.props.project, })
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newState = _fpSet(e.target.name, e.target.value, this.state);
    this.setState(newState, () => {});
    this.updateProjectDebounce();
  }

  updateProject = () => this.props.updateProject(this.state.project);

  updateProjectDebounce = _debounce(this.updateProject, 1000);

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
/*
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
  */

  panelInfo = documentation.overviewPanel;

  getInfoText = () => {
    return `# ${this.props.title}\n\n${this.panelInfo}\n\n${Object.keys(this.state.overviewDataCards).map(cardId => {
      const card = this.state.overviewDataCards[cardId];
      return `## ${card.title}\n\n${card.info??""}\n\n`
    }).join('')}`;
  }

  render() {
    return (
      <div>
        <InfoButton level={1} label={this.props.title} info={this.getInfoText()} />
        {
          Object.keys(this.state.overviewDataCards).map(cardId => {
            const card = this.state.overviewDataCards[cardId];
            return (
              <div className="bp3-card panel-card" id={`overview-data-${cardId}-card`} key={`overview-data-${cardId}-card`}>
                <h3>{card.title}</h3>
                {
                  Object.keys(card.parameters).map(paramId => {
                    const param = card.parameters[paramId];
                    return (
                      <FormGroup
                        inline
                        className="inline-input"
                        key={`overview-${paramId}-input`}
                        label={renderInputLabel(param)}
                        labelFor={`overview-${paramId}-input`}>
                        {
                          renderInputField("overview", param, this.state, this.handleChange)
                        }
                      </FormGroup>
                    )
                  })
                }  
              </div>
            )
          })
        }
        {
        /* todo: implement
        <div id="results-overview" className="bp3-card panel-card">
          <h3>Results overview (placeholder)</h3>
          <ScatterChart {...this.chartSettings}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="x" unit="-" />
            <YAxis type="number" dataKey="y" name="y" unit="-" />
            <Tooltip />
            <Scatter name="Placeholder data" data={this.placeholderData} fill="#8884d8" />

          </ScatterChart>
        </div>
        */
        }

        <div id="about-project" className="bp3-card panel-card">
          <h3>About IEA EBC Annex 75</h3>
          <p>{strings.aboutAnnex75.en}</p>
        </div>
      </div>
    )
  }
}