import React from 'react';
import { shallow } from 'enzyme';
import { Workspace } from '../Workspace';
import { IWorkspaceData } from '../../types';

describe('<Workspace />', () => {
    it('renders without crashing', () => {
        const update = () => { };
        const editor = shallow(<Workspace item={{ id: "defaultId", value: "", owner: "defOwner", }} updateProject={update} />);
        expect(editor.find('textarea').length).toEqual(1);
    });

    it('formats the text in the input', () => {
        // Given
        const testStr = 'hello world';
        const update = () => { };
        const editor = shallow(<Workspace item={{ id: "defaultId", value: testStr, owner: "defOwner", }} updateProject={update} />);

        // When
        //editor.setState({value: testStr});

        // Then
        const output = editor.find('div.workspace-output').html();
        const expected = `The value in the text box is "${testStr}"`;
        expect(output.indexOf(expected) > -1).toEqual(true);
    });

    it('calls updateProject when the input changes', () => {
        // Given
        let theProject: IWorkspaceData | undefined;
        const update = (project: IWorkspaceData) => {
            theProject = project;
        };
        const testStr = 'hello world';
        const editor = shallow(<Workspace item={{ id: "defaultId", value: testStr, owner: "defOwner", }} updateProject={update} />);

        // When
        //editor.setState({value: testStr});

        // Then
        editor.find('textarea').simulate("change", { target: { value: `${testStr} ` } });

        expect(theProject).toEqual({ id: "defaultId", value: `${testStr} `, owner: "defOwner", });
    });
});


