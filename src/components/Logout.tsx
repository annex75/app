import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';
import { Spinner } from '@blueprintjs/core';

import { ILogoutProps, ILogoutState } from '../types';

export class Logout extends Component<ILogoutProps, ILogoutState> {
    constructor(props:ILogoutProps) {
        super(props);
        this.state = {
            redirect: false,
        }
    }

    componentDidMount() {
        this.props.fb.app.auth().signOut()
            .then((user) => {
                this.setState({ redirect: true })
            });
    }
    
    render() {
        if (this.state.redirect) {
            return <Redirect to="/" />
        }

        // todo: could be replaced by a component
        return (
            <div style={{ textAlign: "center", position: "absolute", top: "25%", left:"50%"}}>
                <h3>Logging out</h3>
                <Spinner />
            </div>
        )
    }
}