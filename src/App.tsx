import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Workspace } from './components/Workspace';


const App: React.FC = () => {
  return (
    <div className="wrapper">
      <Header />
      <div className="workspace">
        <Workspace />
      </div>
      <Footer />
    </div>
  );
}

export default App;
