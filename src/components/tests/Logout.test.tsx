import React from 'react';
import { shallow } from 'enzyme';
import { Logout } from '../Logout';
import {  } from '../../types';
import { FirebaseInstance } from '../../base';

describe('<Logout />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<Logout fb={new FirebaseInstance()} />);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


