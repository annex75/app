import React, { Component } from 'react';
import { IFooterState, IFooterProps } from '../types';

export class Footer extends Component<IFooterProps, IFooterState> {
    constructor(props: IFooterProps) {
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
