import React, { Component, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { IProjectListProps, IProjectListState, IProjectSettingsProps, IProjectSettingsState, IProject } from '../types';
import { Button, Popover, PopoverInteractionKind, Position, Alert, Intent } from '@blueprintjs/core';
import { APP_VERSION } from '../constants';

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
    constructor(props:any) {
        super(props);
        let popovers:any = {};
        for (const id in props.projects) {
            popovers[id] = false;
        }

        this.state = {
            projects: props.projects,
            projectPopoverOpen: popovers,
        }
    }

    //todo: do we need to do something here?
    closeProjectPopover = () => {

    }
    
    render() {
        const activeProjectIds = Object.keys(this.props.projects).filter(id => isActive(this.props.projects[id]));

        return (
            <div>
                <h1 style={{marginBottom: "0.5em"}}>Projects</h1>
                {
                    activeProjectIds.length?
                    (<div style={projectListStyles}>
                        {
                            activeProjectIds.map(id => {
                                const project = this.props.projects[id];
                                return (
                                    <div key={id} style={projectCardStyles} className="bp3-card bp3-elevation-0 bp3-interactive">
                                        <h5><Link to={`/projects/${id}`}>{project.name}</Link></h5>
                                        <Popover
                                            content={(<ProjectSettings project={project} updateProject={this.props.updateProject} copyProject={this.props.copyProject} deleteProject={this.props.deleteProject} postSubmitHandler={this.closeProjectPopover}/>)}
                                            interactionKind={PopoverInteractionKind.CLICK}
                                            isOpen={this.state.projectPopoverOpen[id]}
                                            onInteraction={(state) => {
                                                let projectPopoverOpen = { ...this.state.projectPopoverOpen };
                                                projectPopoverOpen[id] = state;
                                                this.setState({projectPopoverOpen});
                                            }}
                                            position={Position.BOTTOM}>
                                            <button className="bp3-button bp3-minimal bp3-icon-cog" aria-label="project settings"></button>
                                        </Popover>
                                    </div>
                                )
                            })
                        }
                    </div>)
                    : <div><h2>No projects have been created.</h2></div>
                }
            </div>
        )
    }
}

// todo: possibly add more checks here
const isActive = (project: IProject) => {
    return (!project.deleted && project.appVersion === APP_VERSION);
}

class ProjectSettings extends Component<IProjectSettingsProps,IProjectSettingsState> {
    nameInput: HTMLInputElement;
    projectForm: HTMLFormElement;
    
    constructor(props:any) {
        super(props);
        this.state= {
            deleteProjectWarningOpen: false,
            project: props.project,
        }
    }

    handleCopy= () => {
        this.props.copyProject(this.state.project);
    }

    handleDelete = () => {
        this.props.deleteProject(this.state.project.id);
    }

    handleAlertOpen = () => this.setState({ deleteProjectWarningOpen: true });
    handleAlertCancel = () => this.setState({ deleteProjectWarningOpen: false }); 
    handleAlertConfirm = () => {
        this.setState({ deleteProjectWarningOpen: false });
        this.handleDelete();
    }

    updateProject = (event:React.FormEvent) => {
        event.preventDefault();

        const name = this.nameInput.value;
        const project = { ...this.state.project };
        project.name = name;
        this.props.updateProject(project);
        this.setState( { project });

        this.projectForm.reset();
    }

    render() {
        return (
            <div style={{padding: "10px"}}>

                <form onSubmit={(event) => this.updateProject(event)} ref={(form) => this.projectForm = form! }>
                    <label className="bp3-label">
                        Project name
                        <input style={{width: "100%"}} className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder={this.state.project.name}></input>
                    </label>
                    <input style={{width: "100%"}} type="submit" className="bp3-button bp3-intent-primary" value="Update Project"></input>
                </form>
                <Button minimal icon="duplicate" onClick={this.handleCopy} style={{padding: "10px"}}>Duplicate project</Button>
                <Button minimal icon="delete" onClick={this.handleAlertOpen} style={{padding: "10px"}}>Delete project</Button>
                <Alert
                    cancelButtonText="Cancel"
                    confirmButtonText="Delete project"
                    intent={Intent.DANGER}
                    isOpen={this.state.deleteProjectWarningOpen}
                    onCancel={this.handleAlertCancel}
                    onConfirm={this.handleAlertConfirm}
                >
                    <p>
                        Are you sure you want to delete this project? This action is irreversible!
                    </p>
                </Alert>
            </div>
        )
    }
}

