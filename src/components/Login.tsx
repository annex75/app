import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Intent } from '@blueprintjs/core';
import { AppToaster } from '../toaster';
import { ILoginProps, ILoginState } from '../types';

const loginStyles = {
    width: "90%",
    maxWidth: "315px",
    margin: "20px auto",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "10px",
}

export class Login extends Component<ILoginProps, ILoginState> {
    emailInput: HTMLInputElement;
    passwordInput: HTMLInputElement;
    loginForm: HTMLFormElement;

    constructor(props:ILoginProps) {
        super(props);
        this.state = {
            redirect: false,
        }
    }

    authWithGoogle = () => {
        this.props.fb.signInWithGooglePopup()
            .then((user: firebase.auth.UserCredential) => {
                this.props.setCurrentUser(user);
                this.setState( { redirect:true } );
            })                         
            .catch(error => {
                //todo: should this toast propagate to App?
                AppToaster.show({ intent: Intent.DANGER, message: "Unable to sign in with Google" });
            });
    }

    authWithEmailPassword = (event:React.FormEvent) => {
        event.preventDefault();
        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        this.props.fb.app.auth().fetchSignInMethodsForEmail(email)
            .then((providers) => {
                if (!(providers.length)) {
                    // create user
                    return this.props.fb.app.auth().createUserWithEmailAndPassword(email, password);
                } else if (providers.indexOf("password") === -1) {
                    // they used google
                    this.loginForm.reset();
                    AppToaster.show( { intent: Intent.WARNING, message: "Could not sign in. Try authenticating using Google."})
                } else {
                    // sign user in
                    return this.props.fb.app.auth().signInWithEmailAndPassword(email, password);
                }
            })
            .then((user) => {
                if (user && user.user) {
                    this.loginForm.reset();
                    this.props.setCurrentUser(user);
                    this.setState({ redirect: true });
                }
            })
            .catch((error) => {
                AppToaster.show({ intent: Intent.DANGER, message: error.message })
            });
        /*console.table([{
            email: this.emailInput.value,
            password: this.passwordInput.value,
        }])*/
    }

    render() {
        const { from } = this.props.location.state || { from: { pathname: '/projects' } }
        if (this.state.redirect) {
            return <Redirect to={from} />
        }

        return (
            <div style={loginStyles}>
                <button style={{width: "100%"}} className="pt-button pt-intent-primary" onClick={() => { this.authWithGoogle() }}>Login with Google</button>
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                
                <form onSubmit={(event)=>{this.authWithEmailPassword(event)}} ref={(form) => { this.loginForm = form! }}>
                    <div style={{marginBottom: "10px"}} className="bp3-callout bp3-icon-info-sign">
                        <h5>Note</h5>
                        This form will create your account if you do not have one already.
                    </div>
                    <label className="bp3-label">
                        E-mail
                        <input style={{width: "100%"}} className="bp3-input" name="email" type="email" ref={(input) => { this.emailInput = input! }} placeholder="E-mail"></input>
                    </label>
                    <label className="bp3-label">
                        Password
                        <input style={{width: "100%"}} className="bp3-input" name="password" type="password" ref={(input) => { this.passwordInput = input! }} placeholder="Password"></input>
                    </label>
                    <input style={{width: "100%"}} type="submit" className="bp3-button bp3-intent-primary" value="Log in"></input>
                </form>
            </div>
        )
    }
}