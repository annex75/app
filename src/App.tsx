// external
import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { RebaseBinding } from 're-base';
import firebase, { Unsubscribe } from 'firebase';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Spinner } from '@blueprintjs/core';
import { Intent } from '@blueprintjs/core';
import xlsx from 'xlsx';

// internal
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Logout } from './components/Logout';
import { Workspace } from './components/Workspace';
import { IProject, IAppProps, IAppState, Project } from './types';
import './style/stylesheet.css';
import { Firebase } from './base';
import { ProjectList } from './components/ProjectList';
import { AppToaster } from './toaster';
import { APP_VERSION } from './constants';

// todo: not really typescript, no type safety but couldn't get it to work
// cf: https://stackoverflow.com/questions/47747754/how-to-rewrite-the-protected-router-using-typescript-and-react-router-4-and-5/47754325#47754325
function AuthenticatedRoute({ component: Component, authenticated, ...rest }: any) {
  const routeComponent = (props: any) => (
    authenticated?
      <Component {...props} {...rest} />
      : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  );
  return <Route {...rest} render={routeComponent} />;
}

// use this when multiple items should open the same component
function AuthenticatedRouteMulti({ component: Component, items, param, ...rest }: any) {
  return (
    <Route  {...rest}
      render={({ match, ...props }) => {
        if (rest.requireAuth && !rest.authenticated) {
          return (
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
          );
        }

        const item = items[match.params[param]];
        if (item) {
          return <Component item={item} {...props} match={match} {...rest} />;
        } else {
          return <h1>Component not found</h1>;
        }
      }
      }
    />
  )
}

class App extends Component<IAppProps, IAppState> {
  dataRef: RebaseBinding;
  fb: Firebase;
  removeAuthListener: Unsubscribe;

  constructor(props: IAppProps) {
    super(props);
    this.state = {
      projects: {},
      loading: true,
      currentUser: null,
    };
    this.fb = new Firebase();
  }

  componentDidMount() {
    this.removeAuthListener = this.fb.app.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          currentUser: user,
        });
        this.dataRef = this.fb.base.syncState(`projects/${user.uid}`, {
          context: this,
          state: 'projects',
          then: () => {
            this.setState({
              loading: false,
            });
          },
        });
      } else {
        this.setState({
          currentUser: null,
          loading: false,
        });
        this.fb.base.removeBinding(this.dataRef);
      }

    });

  }

  componentWillUnmount() {
    this.removeAuthListener();
    this.fb.base.removeBinding(this.dataRef);
  }

  addProject = (name: string, workbook: xlsx.WorkBook | null) => {
    if (!this.state.currentUser) {
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be added: no user signed in" });
    } else if (!this.validProjectName(name)) {
      // todo: save warning messages somewhere
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be added: project name is empty or is not unique" });
    } else {
      let project = new Project(name, this.state.currentUser!.uid);
      if ( workbook ) try {
        project.updateFromWorkbook(workbook);
      } catch (err) {
        AppToaster.show({ intent: Intent.DANGER, message: err.message });
        return;
      }
      
      const projects = { ...this.state.projects };
      projects[project.id] = project.jsonData;
      this.setState({ projects });
    }
  }

  // todo: merge this method with addProject()
  copyProject = (project: IProject) => {
    const copyname = `${project.name}-copy`
    if (!this.state.currentUser) {
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be copied: no user signed in" });
    } else if (!this.validProjectName(copyname)) {
      console.log(copyname);
      // todo: save warning messages somewhere
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be copied: project name is not unique" });
    } else {
      let projectClone = _.cloneDeep(project);
      projectClone.id = uuidv4();
      projectClone.name = copyname;

      const projects = { ...this.state.projects };
      projects[projectClone.id] = projectClone;
      this.setState({ projects });
    }
  }

  validProjectName = (projectName: string, projectId: string = "") => {
    let valid = true;
    if (projectName === "") {
      valid = false;
    } else {
      const projects = { ...this.state.projects }
      for (const id in projects) {
        if (id !== projectId && !projects[id].deleted && projects[id].appVersion === APP_VERSION && projects[id].name === projectName) {
          valid = false;
          break;
        }
      }
    }
    return valid;
  }

  updateProject = (project: IProject) => {
    if (!this.validProjectName(project.name, project.id)) {
      // todo: save warning messages somewhere
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be updated: project name is not unique" });
    } else {
      
      const projects = { ...this.state.projects };
      
      projects[project.id] = project;
      this.setState({ projects });
    }
  }

  // todo: update this to actually remove the project from db
  deleteProject = (id: string) => {
    const projects = { ...this.state.projects };
    projects[id].deleted = true;
    this.setState(() => ({
      projects: projects
    }));
  }

  setCurrentUser = (userCred: firebase.auth.UserCredential) => {
    if (userCred) {
      this.setState({
        currentUser: userCred.user,
        loading: false,
      });
    } else {
      this.setState({
        currentUser: null,
        loading: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={{ textAlign: "center", position: "absolute", top: "25%", left: "50%" }}>
          <h3>Loading</h3>
          <Spinner />
        </div>
      )
    }
    return (
      <div className="app-body">
        <BrowserRouter>
          <div className="app-container">
            <Header
              userData={this.state.currentUser}
              addProject={this.addProject}
              authenticated={!!this.fb.app.auth().currentUser} />
            <div className="main-content">
              <div className="workspace-wrapper">
                <Route exact path="/" render={ props => {
                  return (
                    <div>
                      <h1>IEA EBC Annex 75 - Cost-effective Building Renovation at District Level Combining Energy Efficiency & Renewables</h1>
                      <p>Buildings are a major source of greenhouse gas emissions and cost-effectively reducing their energy use and associated emissions is particularly challenging for the existing building stock, mainly because of the existence of many architectural and technical hurdles. The transformation of existing buildings into low-emission and low-energy buildings is particularly challenging in cities, where many buildings continue to rely too much on heat supply by fossil fuels.</p>
                    </div>
                  )
                }} />
                <Route exact path="/login" render={ props => {
                  return (
                    <Login authenticated={!!this.fb.app.auth().currentUser} setCurrentUser={this.setCurrentUser} {...props} fb={this.fb} />
                  )
                }} />
                <Route exact path="/logout" render={ props => {
                  return (
                    <Logout fb={this.fb} />
                  )
                }} />
                <AuthenticatedRoute
                  exact={true}
                  path="/projects"
                  authenticated={!!this.fb.app.auth().currentUser}
                  component={ProjectList}
                  projects={this.state.projects}
                  updateProject={this.updateProject}
                  copyProject={this.copyProject}
                  deleteProject={this.deleteProject}
                />
                <AuthenticatedRouteMulti
                  path="/projects/:projectId"
                  component={Workspace}
                  authenticated={!!this.fb.app.auth().currentUser}
                  requireAuth={true}
                  param="projectId"
                  items={this.state.projects}
                  updateProject={this.updateProject}
                  currentUser={this.state.currentUser}
                />
              </div>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
