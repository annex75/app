import React from 'react';
import { shallow } from 'enzyme';
import { NewProjectForm } from '../NewProjectForm';
import {  } from '../../types';
import { noop } from './testUtils';

describe('<NewProjectForm />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<NewProjectForm addProject={noop} postSubmitHandler={noop} />);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


