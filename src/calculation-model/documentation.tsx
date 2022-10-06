import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import documentationMd from './documentation.md'

interface ICalcModDocProps {

}

interface ICalcModDocState {
  md: string;
}

export class CalculationModelDocumentation extends Component<ICalcModDocProps, ICalcModDocState> {
  constructor(props: ICalcModDocProps) {
    super(props);
    this.state = {
      md: "",
    }
  }

  componentDidMount() {
    fetch(documentationMd).then(res => res.text()).then(text => this.setState({ md: text }));
  }

  render() {
    const { md } = this.state;
    return (
      <div id="calculation-model-documentation">
          <ReactMarkdown 
            children={md}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
          />
      </div>
    ) 
  }
}

