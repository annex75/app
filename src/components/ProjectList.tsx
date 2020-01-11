import React, { Component, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { IProjectListProps, IProjectListState } from '../types';

const projectListStyles:CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
}

const projectCardStyles = {
    maxWidth: "30%",
    minWidth: "150px",
    flex: "1",
    margin: "5px",

}

export class ProjectList extends Component<IProjectListProps, IProjectListState> {    
    render() {
        const projectIds = Object.keys(this.props.projects);
        console.log(projectIds);
        return (
            <div>
                <h1 style={{marginBottom: "0.5em"}}>Projects</h1>
                <div style={projectListStyles}>
                    {
                        projectIds.map(id => {
                            const project = this.props.projects[id];
                            return (
                                <div key={id} style={projectCardStyles} className="bp3-card bp3-elevation-0 bp3-interactive">
                                    <h5><Link to={`/projects/${id}`}>{project.id}</Link></h5>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

