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

class App extends Component<IAppProps, IAppState> {
    dataRef: RebaseBinding;
    fb: Firebase;
    removeAuthListener: Unsubscribe;
    currentUser: any;

    constructor(props: IAppProps) {
        super(props);
        this.state = {
            dataSets: {
                "dataA": { id: "dataA", value: "Type something here" },
                "dataB": { id: "dataB", value: "Type something else" },
            },
            authenticated: false,
            loading: true,
            currentUser: null,
        };
        this.fb = new Firebase();
    }

    addData = (value: string) => {
        const dataSets = { ...this.state.dataSets };
        const id = uuidv4();
        dataSets[id] = {
            id: id,
            value: value,
        }
        this.setState({ dataSets });
    }

    updateData = (data: IAppData) => {
        const dataSets = { ...this.state.dataSets };
        dataSets[data.id] = data;
        this.setState({ dataSets });
    }

    setCurrentUser = (user: any) => {
        if (user) {
            this.setState({
                currentUser: user,
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

    componentWillMount() {
        this.removeAuthListener = this.fb.app.auth().onAuthStateChanged((user) => {
            this.setState({
                authenticated: user? true: false,
                loading: false,
            });
        });
        this.dataRef = this.fb.base.syncState('dataSets', {
            context: this,
            state: 'dataSets',
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
                                <Route path="/dataSets/:dataId" render={(props) => {
                                    const data = this.state.dataSets[props.match.params.dataId];
                                    return (
                                        data?
                                            <Workspace data={data} updateData={this.updateData} />
                                            : <h3>Data does not exist</h3>
                                    )
                                }} />
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
