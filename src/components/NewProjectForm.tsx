import React, { Component } from 'react'
import { INewProjectFormProps, INewProjectFormState } from '../types'

const newProjectStyles = {
    padding: '10px'
}

export class NewProjectForm extends Component<INewProjectFormProps, INewProjectFormState> {
    
    projectForm: HTMLFormElement;
    nameInput: HTMLInputElement;

    createProject = (event:React.FormEvent) => {
        event.preventDefault();

        const name = this.nameInput.value;
        this.props.addProject(name);

        this.projectForm.reset();
        this.props.postSubmitHandler();
    }
    
    render() {
        return (
            <div style={newProjectStyles}>
                <form onSubmit={(event) => this.createProject(event)} ref={(form) => this.projectForm = form! }>
                    <label className="bp3-label">
                        Project name
                        <input style={{width: "100%"}} className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder="Project name"></input>
                    </label>
                    <input style={{width: "100%"}} type="submit" className="bp3-button bp3-intent-primary" value="Add Project"></input>
                </form>
            </div>
        )
    }
}