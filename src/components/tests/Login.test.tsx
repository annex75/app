import React from 'react';
import { shallow } from 'enzyme';
import { Login } from '../Login';
import { noop } from './testUtils'
import { FirebaseInstance } from '../../base';

describe('<Login />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<Login authenticated={false} setCurrentUser={noop} location={""} fb={new FirebaseInstance()}/>);
        //expect(editor.find('textarea').length).toEqual(1);
    });
});


