import React, { Component } from 'react'
/*
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'7
import documentationMd from './documentation.md'
*/
import { secureLink } from '../helpers';
import { strings } from '../constants/textData'

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
    //fetch(documentationMd).then(res => res.text()).then(text => this.setState({ md: text }));
  }

  render() {
    // const { md } = this.state;
    return (
      // Currently, documentation resides in OverLeaf which is not sustainable. It should ideally be moved to this git repo.
      <div>Detailed documentation for the calculation model is available on {secureLink(strings.pdfDocsLink, "GitHub")}.</div>
      /*
      <div id="calculation-model-documentation">
          <ReactMarkdown 
            children={md}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
          />
      </div>
      */
    ) 
  }
}

