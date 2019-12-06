import React, { Component } from 'react';
import { IAppState, IAppProps } from '../types/index';

import App from '../App';



export class Footer extends Component<IAppProps, IAppState> {
    constructor (props:IAppProps) {
        super(props);
        this.state = { year: new Date().getFullYear() };
    }
    render() { 
        return (
            <footer>
                <ul className="site-link">
                    <li>
                        &copy; {this.state.year} StruSoft AB
                    </li>    
                </ul>
            </footer>
        );
    }
} 
