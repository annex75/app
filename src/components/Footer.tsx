import React, { Component } from 'react';
import { IFooterState, IFooterProps } from '../types';
import { Button, AnchorButton } from '@blueprintjs/core';

export class Footer extends Component<IFooterProps, IFooterState> {
    constructor(props: IFooterProps) {
        super(props);
        this.state = { year: new Date().getFullYear() };
    }
    render() { 
        return (
            <nav className="bp3-navbar bp3-align-right" style={{display: "flex", flexDirection: "row"}}>
                <div className="bp3-navbar-group bp3-align-left">
                    <AnchorButton className="bp3-button bp3-minimal" href="http://annex75.iea-ebc.org/about" target="_blank">About Annex 75</AnchorButton>
                    <Button minimal icon="help"></Button>
                </div>
                <div className="bp3-navbar-group bp3-align-right" style={{display: "flex", alignItems: "flex-end", flex: "1 1 auto"}}>
                    <ul className="site-link bp3-align-right" style={{flex: "1 1 auto", textAlign: "right",}}>
                        <li>
                            &copy; {this.state.year} StruSoft AB
                        </li>    
                    </ul>
                </div>
            </nav>
        );
    }
} 
