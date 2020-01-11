import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Logout } from './components/Logout';
import { Workspace } from './components/Workspace';
import { IProject, IAppProps, IAppState } from './types';

import { Firebase } from './base';
import { RebaseBinding } from 're-base';
import { Unsubscribe } from 'firebase';

import { v4 as uuidv4 } from 'uuid';
import { ProjectList } from './components/ProjectList';
import { Spinner } from '@blueprintjs/core'

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

    addProject = (value: string) => {
        if (!this.state.currentUser) {
            throw Error("Project was added with no user signed in");
        }
        const projects = { ...this.state.projects };
        const id = uuidv4();
        projects[id] = {
            id: id,
            value: value,
            owner: this.state.currentUser!.uid,
        }
        console.log(projects);
        this.setState({ projects });
    }

    updateProject = (project: IProject) => {
        const projects = { ...this.state.projects };
        projects[project.id] = project;
        this.setState({ projects });
    }

    setCurrentUser = (userCred: firebase.auth.UserCredential) => {
        console.log(userCred.user)
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
            <div style={{ maxWidth: "1160px", margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" }}>
                <BrowserRouter>
                    <div style={{flex: "1 1 auto"}}>
                        <Header addProject={this.addProject} authenticated={this.state.authenticated} />
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
