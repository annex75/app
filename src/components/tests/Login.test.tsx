import React from 'react';
import { shallow } from 'enzyme';
import { Login } from '../Login';
import {  } from '../../types';
import { noop } from './testUtils'
import { Firebase } from '../../base';

describe('<Login />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<Login setCurrentUser={noop} location={""} fb={new Firebase()}/>);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


