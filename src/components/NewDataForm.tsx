import React, { Component } from 'react'
import { INewDataFormProps, INewDataFormState } from '../types'

const newDataStyles = {
    padding: '10px'
}

export class NewDataForm extends Component<INewDataFormProps, INewDataFormState> {
    
    dataForm: HTMLFormElement;
    titleInput: HTMLInputElement;

    createData = (event:React.FormEvent) => {
        event.preventDefault();

        const title = this.titleInput.value;
        this.props.addData(title);

        this.dataForm.reset();
        this.props.postSubmitHandler();
    }
    
    render() {
        return (
            <div style={newDataStyles}>
                <form onSubmit={(event) => this.createData(event)} ref={(form) => this.dataForm = form! }>
                    <label className="bp3-label">
                        Dataset name
                        <input style={{width: "100%"}} className="bp3-input" name="title" type="text" ref={(input) => { this.titleInput = input! }} placeholder="Dataset name"></input>
                    </label>
                    <input style={{width: "100%"}} type="submit" className="bp3-button bp3-intent-primary" value="Add Dataset"></input>
                </form>
            </div>
        )
    }
}