import React from 'react';
import { shallow } from 'enzyme';
import { render } from '@testing-library/react';
import { Workspace } from '../Workspace';
import { IWorkspaceData } from '../../types';

describe('<Workspace />', () => {
  it('renders without crashing', () => {
    const update = () => {};
    const editor = shallow(<Workspace data={{id: "defaultId", value: ""}} updateData={update} />);
    expect(editor.find('textarea').length).toEqual(1);
  });

  it('formats the text in the input', () => {
    // Given
    const testStr = 'hello world';
    const update = () => {};
    const editor = shallow(<Workspace data={{id: "defaultId", value: testStr}} updateData={update}/>);
    
    // When
    //editor.setState({value: testStr});

    // Then
    const output = editor.find('div.workspace-output').html();
    const expected = `The value in the text box is "${testStr}"`;
    expect(output.indexOf(expected) > -1).toEqual(true);
  });

  it('calls updateData when the input changes', () => {
    // Given
    let theData : IWorkspaceData = { id: "defaultId", value: "" };
    const update = (data: IWorkspaceData) => {
      theData = data;
    };
    const testStr = 'hello world';
    const editor = shallow(<Workspace data={{id: "defaultId", value: testStr}} updateData={update}/>);
    
    // When
    //editor.setState({value: testStr});

    // Then
   editor.find('textarea').simulate("change", { target: { value: `${testStr} `}});
    
    expect(theData).toEqual({ value: `${testStr} ` });
  });
});


