import React from 'react';
import { shallow } from 'enzyme';
import { ProjectList } from '../ProjectList';
import {  } from '../../types';

describe('<ProjectList />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<ProjectList projects={{}} />);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


