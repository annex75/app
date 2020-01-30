import React from 'react';
import { shallow } from 'enzyme';
import { Workspace } from '../Workspace';
import { IWorkspaceData } from '../../types';
import { generateDefaultProject } from './testUtils';

describe('<Workspace />', () => {
    const defProj = generateDefaultProject();

    it('renders without crashing', () => {
        const update = () => { };
        
        const editor = shallow(<Workspace item={defProj} updateProject={update} />);
        expect(editor.find('#WorkspaceTabs').length).toEqual(1);
    });
    
    /*
    it('calls updateProject when the input changes', () => {
        // Given
        let theProject: IWorkspaceData | undefined;
        const update = (project: IWorkspaceData) => {
            theProject = project;
        };
        const testStr = 'hello world';
        const editor = shallow(<Workspace item={defProj} updateProject={update} />);

        // When
        //editor.setState({value: testStr});

        // Then
        editor.find('#WorkspaceTabs').simulate("change", { target: { value: `${testStr} ` } });

        expect(theProject).toEqual({ id: "defaultId", value: `${testStr} `, owner: "defOwner", });
    });
    */
});


