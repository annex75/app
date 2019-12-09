import React from 'react';
import App from '../App';
import { shallow } from 'enzyme';

test('renders app without crashing', () => {
    const app = shallow(<App />);
});
