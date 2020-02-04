import React, { Component, ChangeEvent, FormEvent } from 'react';

import { IOverviewPanelProps, IOverviewPanelState } from '../../types';
import { TextArea, FormGroup, InputGroup,/*, NumericInput, */Tooltip } from '@blueprintjs/core';

import { set as _fpSet } from 'lodash/fp';
import { ScatterChart, CartesianGrid, XAxis, YAxis, Scatter } from 'recharts';
import { strings } from '../../constants/textData';

export class OverviewPanel extends Component<IOverviewPanelProps, IOverviewPanelState> {

    constructor(props: IOverviewPanelProps) {
        super(props);
        this.state = {
            project: props.project,
        }
    }

    handleChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newState = _fpSet(e.target.name, e.target.value, this.state);
        this.setState(newState);
        this.props.updateProject(newState.project);
    }

    handleInput = (e:FormEvent<HTMLInputElement>) => {
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

    render() {
        const { project } = this.state;
        return (
            <div>
                <h1>{this.props.title}</h1>
                <div id="assessment-info" className="bp3-card panel-card">
                    <h2>Assessment information</h2>
                    <FormGroup
                        label="Contact info"
                    >
                        <FormGroup 
                            inline
                            label="Name:"
                            labelFor="name-input">
                            <InputGroup 
                                name="project.overviewData.contactInfo.name"
                                id="name-input"
                                onChange={this.handleChange}
                                value={project.overviewData.contactInfo.name}/>
                        </FormGroup>
                        <FormGroup
                            inline
                            label="E-mail:"
                            labelFor="email">
                            <InputGroup
                                type="email"
                                name="project.overviewData.contactInfo.email"
                                id="email-input"
                                onChange={this.handleChange}
                                value={project.overviewData.contactInfo.email}/>
                        </FormGroup>
                        <FormGroup
                            inline
                            label="Affiliation:"
                            labelFor="affiliation-input">
                            <InputGroup 
                                name="project.overviewData.contactInfo.affiliation"
                                id="affiliation-input"
                                onChange={this.handleChange}
                                value={project.overviewData.contactInfo.affiliation}/>
                        </FormGroup>
                    </FormGroup>

                    <FormGroup
                        label="Tools used"
                        labelFor="tools-info"
                    >
                        {/*todo: make this a list instead of just a text area*/}                        
                        <TextArea
                            fill
                            id="tools-info"
                            name="project.overviewData.toolsInfo"
                            onChange={this.handleChange}
                            value={project.overviewData.toolsInfo} />    
                    </FormGroup>
                    
                </div>

                <div id="location-info" className="bp3-card panel-card">
                    <h2>Location</h2>
                    <FormGroup
                        inline
                        label="Country:"
                        labelFor="country-input">
                        <InputGroup 
                            name="project.overviewData.location.country.country"
                            id="country-input"
                            disabled
                            value={project.calcData.district.location.country.country}/>                
                    </FormGroup>
                    <FormGroup
                        inline
                        label="City:"
                        labelFor="city-input">
                        <InputGroup 
                            name="project.overviewData.location.place"
                            id="city-input"
                            disabled
                            value={project.calcData.district.location.place}/>
                    </FormGroup>
                    <FormGroup
                        inline
                        label="Latitude:"
                        labelFor="lat-input">
                        <input
                            className="bp3-input"
                            name="project.overviewData.location.lat"
                            id="lat-input"
                            min={-90}
                            max={90}
                            type="number"
                            disabled
                            value={project.calcData.district.location.lat}/>
                        {/* Annoying that we can't use this, but it does not expose NumericInput
                        <NumericInput 
                            name="project.overviewData.location.lat"
                            id="lat-input"
                            min={-90}
                            max={90}
                            onInput={this.handleInput}
                            value={project.overviewData.location.lat}/>
                        */}
                    </FormGroup>
                    <FormGroup
                        inline
                        label="Longitude:"
                        labelFor="lon-input">
                        <input
                            className="bp3-input"
                            name="project.overviewData.location.lon"
                            id="lon-input"
                            min={-90}
                            max={90}
                            type="number"
                            disabled
                            value={project.calcData.district.location.lon}/>
                            
                    </FormGroup>
                    
                </div>

                <div id="results-overview" className="bp3-card panel-card">
                    <h2>Results overview</h2>
                    <ScatterChart {...this.chartSettings}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="x" name="x" unit="-"/>
                        <YAxis type="number" dataKey="y" name="y" unit="-"/>
                        {/* todo: Tooltip does not seem to do anything */}
                        <Tooltip />
                        <Scatter name="Placeholder data" data={this.placeholderData} fill="#8884d8"/>

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