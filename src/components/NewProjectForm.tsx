// external
import xlsx from 'xlsx';
import React, { Component } from 'react'
import { Button, FileInput, Spinner } from '@blueprintjs/core';

//internal
import { INewProjectFormProps, INewProjectFormState } from '../types'

export class NewProjectForm extends Component<INewProjectFormProps, INewProjectFormState> {

  projectForm: HTMLFormElement;
  nameInput: HTMLInputElement;

  constructor(props: INewProjectFormProps) {
    super(props);
    this.state = {
      workbook: null,
      xlsxFile: "",
      uploading: false,
    };
  }

  createProject = (event: React.FormEvent) => {
    event.preventDefault();

    const name = this.nameInput.value;
    this.props.addProject(name, this.state.workbook);

    this.projectForm.reset();
    this.props.postSubmitHandler();
  }

  createProjectFromXlsx = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    if (input && input.files && input.files.length) {
      const file = input.files[0]
      this.setState({ 
        xlsxFile: file.name,
        uploading: true,
      });
      const reader = new FileReader();
      new Promise<ProgressEvent<FileReader>>((resolve, reject) => {
        reader.onload = resolve;
      }).then(result => {
        return this.readWorkbook(result);
      }).then(workbook => {
        this.setState({ workbook });
      }).finally(() => {
        this.setState({
          uploading: false,
        });
      });
      reader.readAsArrayBuffer(file);
    }
  }

  readWorkbook = (e: ProgressEvent<FileReader>) => {
    return new Promise<xlsx.WorkBook>((resolve, reject) => {
      const fileContent = e.target!.result as ArrayBuffer;
      const data = new Uint8Array(fileContent);
      const workbook = xlsx.read(data, {type: 'array'});
      resolve(workbook);
    })
  }

  createProjectFromJson = (e: React.FormEvent<HTMLInputElement>) => {

  }

  render() {
    return (
      <div className="new-project-div">
        <form className="new-project-form" onSubmit={(event) => this.createProject(event)} ref={(form) => this.projectForm = form!}>
          <label className="bp3-label">
            Project name
            <input className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder="Project name"></input>
          </label>
          <FileInput 
            className="bp3-intent-primary"
            text={this.state.xlsxFile || "Upload template .xlsx"}
            onInputChange={this.createProjectFromXlsx}
            inputProps={{ accept: ".xlsx" }}/>
          <FileInput disabled
            className="bp3-intent-primary"
            text="Upload project .json"
            onInputChange={this.createProjectFromJson}
            inputProps={{ accept: ".json" }}/>
          <Button
            disabled={this.state.uploading}
            type="submit"
            className="bp3-intent-primary submit-button"
            text={this.state.uploading
            ? (<Spinner size={16}/>)
            : "Add project"}/>
        </form>
      </div>
    )
  }
}