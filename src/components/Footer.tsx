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
                    <ul className="site-link bp3-align-right" style={{flex: "1 1 auto", paddingInlineEnd: "1em", textAlign: "right",}}>
                        <li style={{display: "inline",}}>
                            &copy; {this.state.year} StruSoft AB
                        </li>    
                    </ul>
                    <div className="bp3-align-right" style={{}}>
                        <a href="https://www.iea-ebc.org/">
                            <img className="bp3-align-right" src="http://annex75.iea-ebc.org/Data/skins/ebc/img/ebc.png" alt="EBC Logo" style={{float: "right", maxHeight: "50px", width: "auto", padding: "0.2em"}} />
                        </a>
                    </div>
                </div>
            </nav>
        );
    }
} 
