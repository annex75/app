import React, { Component } from 'react'
import { INewProjectFormProps, INewProjectFormState } from '../types'

const newProjectStyles = {
    padding: '10px'
}

export class NewProjectForm extends Component<INewProjectFormProps, INewProjectFormState> {
    
    projectForm: HTMLFormElement;
    titleInput: HTMLInputElement;

    createProject = (event:React.FormEvent) => {
        event.preventDefault();

        const title = this.titleInput.value;
        this.props.addProject(title);

        this.projectForm.reset();
        this.props.postSubmitHandler();
    }
    
    render() {
        return (
            <div style={newProjectStyles}>
                <form onSubmit={(event) => this.createProject(event)} ref={(form) => this.projectForm = form! }>
                    <label className="bp3-label">
                        Project name
                        <input style={{width: "100%"}} className="bp3-input" name="title" type="text" ref={(input) => { this.titleInput = input! }} placeholder="Project name"></input>
                    </label>
                    <input style={{width: "100%"}} type="submit" className="bp3-button bp3-intent-primary" value="Add Project"></input>
                </form>
            </div>
        )
    }
}