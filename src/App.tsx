import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Logout } from './components/Logout';
import { Workspace } from './components/Workspace';
import { IProject, IAppProps, IAppState, OverviewData } from './types';

import { Firebase } from './base';
import { RebaseBinding } from 're-base';
import { Unsubscribe } from 'firebase';

import _ from 'lodash';

import { v4 as uuidv4 } from 'uuid';
import { ProjectList } from './components/ProjectList';
import { Spinner } from '@blueprintjs/core';
import { Intent } from '@blueprintjs/core';
import { AppToaster } from './toaster';

const mainContentStyles = {
    padding: "1em",
    //flex: "0 1 auto"
}


// todo: not really typescript, no type safety but couldn't get it to work
// cf: https://stackoverflow.com/questions/47747754/how-to-rewrite-the-protected-router-using-typescript-and-react-router-4-and-5/47754325#47754325
function AuthenticatedRoute({component: Component, authenticated, ...rest}: any) {
    const routeComponent = (props: any) => (
        authenticated?
            <Component {...props} {...rest} />
            : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>
    );
    return <Route {...rest} render={routeComponent}/>;
}

// use this when multiple items should open the same component
function AuthenticatedRouteMulti({component: Component, items, param, ...rest}: any) {
    return (
        <Route  {...rest}
            render = {({match, ...props}) => {
                if (rest.requireAuth && !rest.authenticated) {
                    return (
                        <Redirect to={{pathname: '/login', state: {from: props.location}}}/>
                    );
                }

                const item = items[match.params[param]];
                if (item) {
                    return <Component item={item} {...props} match={match} {...rest}/>;
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
            authenticated: false,
            loading: true,
            currentUser: null,
        };
        this.fb = new Firebase();
    }

    addProject = (name: string) => {
        if (!this.state.currentUser) {
            AppToaster.show({ intent: Intent.DANGER, message: "Project could not be added: no user signed in"});
        } else if (!this.validProjectName(name)) {
            // todo: save warning messages somewhere
            AppToaster.show({ intent: Intent.DANGER, message: "Project could not be added: project name is not unique"});
        } else {
            const projects = { ...this.state.projects };
            const id = uuidv4();
            projects[id] = {
                id: id,
                name: name,
                owner: this.state.currentUser!.uid,
                overviewData: new OverviewData(),
                deleted: false,
            }
            this.setState({ projects });
        }
    }

    // todo: merge this method with addProject()
    copyProject = (project: IProject) => {
        const copyname = `${project.name}-copy`
        if (!this.state.currentUser) {
            AppToaster.show({ intent: Intent.DANGER, message: "Project could not be copied: no user signed in"});
        } else if (!this.validProjectName(copyname)) {
            // todo: save warning messages somewhere
            AppToaster.show({ intent: Intent.DANGER, message: "Project could not be copied: project name is not unique"});
        } else {
            const projectClone = _.cloneDeep(project);
            const id = uuidv4();
            projectClone.id = uuidv4();
            projectClone.name = copyname;

            const projects = { ...this.state.projects };
            projects[id] = projectClone;
            this.setState({ projects });
        }
    }

    validProjectName = (projectName: string, projectId: string = "") => {
        let valid = true;
        const projects = { ...this.state.projects }
        for (const id in projects) {
            if (id !== projectId && !projects[id].deleted && projects[id].name === projectName) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    updateProject = (project: IProject) => {
        if (!this.validProjectName(project.name, project.id)) {
            // todo: save warning messages somewhere
            AppToaster.show({ intent: Intent.DANGER, message: "Project could not be updated: project name is not unique"});
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
                authenticated: true,
                loading: false,
            });
        } else {
            this.setState({
                authenticated: false,
                currentUser: null,
                loading: false,
            });
        }
    }

    componentDidMount() {
        this.removeAuthListener = this.fb.app.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({
                    currentUser: user,
                    authenticated: true,
                    loading: false,
                });
                this.dataRef = this.fb.base.syncState(`projects/${user.uid}`, {
                    context: this,
                    state: 'projects',
                });
            } else {
                this.setState({
                    authenticated: false,
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

    render() {
        if (this.state.loading) {
            return (
                <div style={{ textAlign: "center", position: "absolute", top: "25%", left:"50%"}}>
                    <h3>Loading</h3>
                    <Spinner />
                </div>
            )
        }
        return (
            <div style={{ maxWidth: "1220px", margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" }}>
                <BrowserRouter>
                    <div style={{flex: "1 1 auto"}}>
                        <Header userData={this.state.currentUser} addProject={this.addProject} authenticated={this.state.authenticated} />
                        <div className="main-content" style={mainContentStyles}>
                            <div className="workspace-wrapper">
                                <Route exact path="/login" render={(props) => {
                                    return (
                                        <Login setCurrentUser={this.setCurrentUser} {...props} fb={this.fb} />
                                    )
                                }} />
                                <Route exact path="/logout" render={(props) => {
                                    return (
                                        <Logout fb={this.fb} />
                                    )
                                }} />
                                <AuthenticatedRoute
                                    exact={true}
                                    path="/projects"
                                    authenticated={this.state.authenticated}
                                    component={ProjectList}
                                    projects={this.state.projects}
                                    updateProject={this.updateProject}
                                    copyProject={this.copyProject}
                                    deleteProject={this.deleteProject}
                                />
                                <AuthenticatedRouteMulti
                                    path="/projects/:projectId"
                                    component={Workspace}
                                    authenticated={this.state.authenticated}
                                    requireAuth={true}
                                    param="projectId"
                                    items={this.state.projects}
                                    updateProject={this.updateProject}
                                />
                            </div>
                        </div>
                    </div>
                </BrowserRouter>
                <Footer />
            </div>
        );
    }
}

export default App;
