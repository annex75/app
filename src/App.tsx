import React, { Component } from 'react';
import { BrowserRouter, Route  } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Workspace } from './components/Workspace';
import { IDictAppData, IAppData, IAppProps, IAppState } from './types';


class App extends Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.updateData = this.updateData.bind(this);
    this.state = {
      dataSets: {
        "dataA": { id: "dataA", value: "Type something here" },
        "dataB": { id: "dataB", value: "Type something else" },
      },
    };
  }

  updateData(data: IAppData) {
    const dataSets = { ...this.state.dataSets };
    dataSets[data.id] = data;
    this.setState({ dataSets });
  }

  render() {
    return (
      <div className="wrapper">
        <Header />
        <BrowserRouter>
          <div className="main-content">
            <div className="workspace-wrapper">
              <Route path="/dataSets/:dataId" render={(props) => {
                const data = this.state.dataSets[props.match.params.dataId];
                return (
                  data
                  ? <Workspace data={data} updateData={this.updateData} />
                  : <h3>Data does not exist</h3>
                )
              }}/>
            </div>
          </div>
        </BrowserRouter>
        <Footer />
      </div>
    );
  }
}

export default App;
