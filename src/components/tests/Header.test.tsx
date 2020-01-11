import React from 'react';
import { shallow } from 'enzyme';
import { Header } from '../Header';
import {  } from '../../types';
import { noop } from './testUtils'

describe('<Header />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<Header addProject={noop} authenticated={true} />);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


