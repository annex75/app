import React, { Component, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { IProjectListProps, IProjectListState, IProjectSettingsProps, IProjectSettingsState, IProject, IDictProject, IDictPopover } from '../types';
import { Button, Popover, PopoverInteractionKind, Position, Alert, Intent } from '@blueprintjs/core';
import { APP_VERSION } from '../constants';
import { NewProjectForm } from './NewProjectForm';

export class ProjectList extends Component<IProjectListProps, IProjectListState> {
  linkElement: Link;
  constructor(props: any) {
    super(props);
    let popovers: any = {};
    for (const id in props.projects) {
      popovers[id] = false;
    }

    this.state = {
      projects: props.projects,
      projectPopoverOpen: popovers,
      addProjectPopoverOpen: false,
    }
  }

  //todo: do we need to do something here?
  closeProjectPopover = () => {

  }

  closeAddProjectPopover = () => {
    this.setState({
      addProjectPopoverOpen: false,
    });
  }

  onPopoverInteraction = (popoverState: boolean, id: string) => {
    let projectPopoverOpen = { ...this.state.projectPopoverOpen };
    projectPopoverOpen[id] = popoverState;
    this.setState({ projectPopoverOpen });
  }

  render() {
    const activeProjectIds = Object.keys(this.props.projects).filter(id => isActive(this.props.projects[id]));

    return (
      <div>
        <div className="project-list-header">
          <h1 style={{ marginBottom: "0.5em" }}>Projects</h1>
        </div>
        {
          activeProjectIds.length ?
            (<div className="project-list">
              <ProjectCards 
                projects={this.props.projects}
                popoverOpen={this.state.projectPopoverOpen}
                onPopoverInteraction={this.onPopoverInteraction}
                setActiveProject={this.props.setActiveProject}
                updateProject={this.props.updateProject}
                copyProject={this.props.copyProject}
                exportProject={this.props.exportProject}
                deleteProject={this.props.deleteProject}
                postSubmitHandler={this.closeProjectPopover}/>
              {

                /*
                
                */
              }
            </div>)
            : <div><h2>No projects have been created.</h2></div>
        }
        <div className="project-list-footer">
          <Popover
            content={(
              <NewProjectForm
                addProject={this.props.addProject}
                postSubmitHandler={this.closeAddProjectPopover} />)}
            interactionKind={PopoverInteractionKind.CLICK}
            isOpen={this.state.addProjectPopoverOpen}
            onInteraction={(state) => this.setState({ addProjectPopoverOpen: state })}
            position={Position.BOTTOM}>
            <button className="bp3-button bp3-icon-add add-project-button" aria-label="add new project">Add new Project</button>
          </Popover>
        </div>
        
      </div>
    )
  }
}

interface IProjectCardsProps {
  projects: IDictProject;
  popoverOpen: IDictPopover;
  onPopoverInteraction(popoverState: boolean, id: string): void;
  setActiveProject(projectId: string): void;
  updateProject(project: IProject): void;
  copyProject(project: IProject): void;
  exportProject(id:string): void;
  deleteProject(id: string): void;
  postSubmitHandler(): void;
}

function useRefs<T>(length: number): RefObject<T>[]  {
  const refsHolder = React.useRef<RefObject<T>[]>([]);
  const refs = refsHolder.current;
  for (let i = refs.length; i < length; i++) {
      refs[i] = React.createRef<T>();
  }
  refs.length = length;
  return refsHolder.current;
}

const ProjectCards = (props: IProjectCardsProps) => {

  const ids = Object.keys(props.projects).filter(id => isActive(props.projects[id]));;
  const refs = useRefs<HTMLButtonElement>(ids.length);

  // this is a hack to allow the card (except buttons inside the card) to be the link!
  // https://stackoverflow.com/questions/63017636/triggering-click-event-of-child-of-element-generated-from-an-array/63017829#63017829
  const divClick = (i: number, e: any, id: string) => {
    // if we clicked the div outside the button, click the invisible button inside the Link
    if (e.target.id === id && refs && refs[i] && refs[i].current) {
      refs[i].current!.click();
    }
  }

  return (
    <>
    {
      ids.map((id, i) => {
        const project = props.projects[id];
        return (
          <div id={`project-card-div-${id}`} key={`project-card-div-${id}`} className="project-card bp3-card bp3-elevation-0 bp3-interactive" onClick={(e: React.MouseEvent<HTMLDivElement>) => divClick(i,e,`project-card-div-${id}`)}>
            <Link to={`/projects/${id}`} onClick={() => props.setActiveProject(id)}>
              <button ref={refs[i]} style={{display: "none"}}></button>
              <h5>{project.name}</h5>
            </Link>
            <Popover
              content={(
                <ProjectSettings
                  project={project}
                  updateProject={props.updateProject}
                  copyProject={props.copyProject}
                  exportProject={props.exportProject}
                  deleteProject={props.deleteProject}
                  postSubmitHandler={props.postSubmitHandler}/>
              )}
              interactionKind={PopoverInteractionKind.CLICK}
              isOpen={props.popoverOpen[id]}
              onInteraction={(popoverState, e) => props.onPopoverInteraction(popoverState, id)}
              position={Position.BOTTOM}>
              <button className="bp3-button bp3-minimal bp3-icon-cog" aria-label="project settings"/>
            </Popover>
          </div>
        )
        /*
        return (
          <div className="project-card bp3-card bp3-elevation-0 bp3-interactive" onClick={() => divClick(i)}id={`div-${id}`}>
            <button onClick={(e: React.MouseEvent<HTMLElement>) => openProjectSettings(e)} ref={refs[i]} id={`btn-${id}`}/>
          </div>
        );*/
      })
    }
    </>
  )
}

// todo: possibly add more checks here
const isActive = (project: IProject) => {
  return (!project.deleted && project.appVersion === APP_VERSION);
}

class ProjectSettings extends Component<IProjectSettingsProps, IProjectSettingsState> {
  nameInput: HTMLInputElement;
  projectForm: HTMLFormElement;

  constructor(props: any) {
    super(props);
    this.state = {
      deleteProjectWarningOpen: false,
      project: props.project,
    }
  }

  handleCopy = () => {
    this.props.copyProject(this.state.project);
  }

  handleExport = () => {
    this.props.exportProject(this.state.project.id);
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

  updateProject = (event: React.FormEvent) => {
    event.preventDefault();

    const name = this.nameInput.value;
    const project = { ...this.state.project };  
    project.name = name;
    this.props.updateProject(project);
    this.setState({ project });

    this.projectForm.reset();
  }

  render() {
    return (
      <div style={{ padding: "10px" }}>
        <div className="project-settings-content-div">
          <form onSubmit={(event) => this.updateProject(event)} ref={(form) => this.projectForm = form!}>
            <label className="bp3-label">
              Project name
              <input style={{ width: "100%" }} className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder={this.state.project.name}></input>
            </label>
            <input style={{ width: "100%" }} type="submit" className="bp3-button bp3-intent-primary" value="Update Project settings"></input>
          </form>
        </div>
        <div className="project-settings-content-div">
          <Button minimal icon="duplicate" onClick={this.handleCopy} style={{ padding: "10px" }}>Duplicate Project</Button>
          <Button minimal icon="export" onClick={this.handleExport} style={{ padding: "10px" }}>Export Project</Button>
        </div>
        <div className="project-settings-content-div">
          <Button minimal icon="delete" onClick={this.handleAlertOpen} style={{ padding: "10px" }}>Delete Project</Button>
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
      </div>
      
    )
  }
}

