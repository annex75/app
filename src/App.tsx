import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Logout } from './components/Logout';
import { Workspace } from './components/Workspace';
import { IAppData, IAppProps, IAppState } from './types';

import { Firebase } from './base';
import { RebaseBinding } from 're-base';
import { Unsubscribe } from 'firebase';

import { v4 as uuidv4 } from 'uuid';
import DataSetList from './components/DataSetList';
import { Spinner } from '@blueprintjs/core'

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
            dataSets: {},
            authenticated: false,
            loading: true,
            currentUser: null,
        };
        this.fb = new Firebase();
    }

    addData = (value: string) => {
        if (!this.state.currentUser) {
            throw Error("Data was added with no user signed in");
        }
        const dataSets = { ...this.state.dataSets };
        const id = uuidv4();
        dataSets[id] = {
            id: id,
            value: value,
            owner: this.state.currentUser!.uid,
        }
        console.log(dataSets);
        this.setState({ dataSets });
    }

    updateData = (data: IAppData) => {
        const dataSets = { ...this.state.dataSets };
        dataSets[data.id] = data;
        this.setState({ dataSets });
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
                this.dataRef = this.fb.base.syncState(`dataSets/${user.uid}`, {
                    context: this,
                    state: 'dataSets',
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
            <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
                <BrowserRouter>
                    <div>
                        <Header addData={this.addData} authenticated={this.state.authenticated} />
                        <div className="main-content" style={{ padding: "1em" }}>
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
                                    path="/dataSets"
                                    authenticated={this.state.authenticated}
                                    component={DataSetList}
                                    dataSets={this.state.dataSets}
                                />
                                <AuthenticatedRouteMulti
                                    path="/dataSets/:dataId"
                                    component={Workspace}
                                    authenticated={this.state.authenticated}
                                    requireAuth={true}
                                    param="dataId"
                                    items={this.state.dataSets}
                                    updateData={this.updateData}
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
