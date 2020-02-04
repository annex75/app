import React, { Component, ChangeEvent } from "react"
import { IBuildingCardProps, IBuildingCardState } from "../../../types";
import { FormGroup, Button, InputGroup } from "@blueprintjs/core";

export class BuildingCard extends Component<IBuildingCardProps,IBuildingCardState> {

    constructor(props: IBuildingCardProps) {
        super(props);
        this.state = {
            advancedIsOpen: false,
        }
    }

    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log("happens");
        this.props.handleChange(e);
    }

    handleExpandClick = (e:React.MouseEvent<HTMLElement>) => {
        this.setState({ advancedIsOpen: !this.state.advancedIsOpen });
    }

    handleAddBuildingClick = (e: React.MouseEvent<HTMLElement>) => {
        this.props.addBuilding();
    }

    render() {
        const buildings = this.props.data;
        return  (
            <div><h1>{this.state.advancedIsOpen? "open": "closed"}</h1>
                <Button 
                    minimal
                    className="bp3-button"
                    icon={this.state.advancedIsOpen? "arrow-up": "arrow-down"}
                    onClick={this.handleExpandClick}/>
                <Button 
                    minimal
                    className="bp3-button"
                    icon="add"
                    onClick={this.handleAddBuildingClick}/>
                {
                    buildings?    
                        Object.keys(buildings).map(id => {
                            return (
                                <FormGroup
                                inline
                                key={`building-${id}-name-input`}
                                label="Building name"
                                labelFor="building-name-input">
                                <InputGroup
                                    name={`buildings.${id}.name`}
                                    id={`building-${id}-name-input`}
                                    onChange={this.props.handleChange}
                                    value={buildings[id].name}/>
                                </FormGroup>
                            )
                        })
                        : (<p>No buildings have been added</p>)
                }           
            </div>
        )
    }
}