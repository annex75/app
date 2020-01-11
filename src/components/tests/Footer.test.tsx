import React from 'react';
import { shallow } from 'enzyme';
import { Footer } from '../Footer';
import {  } from '../../types';

describe('<Footer />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<Footer />);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


