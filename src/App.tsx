import React, { Fragment, useState, useEffect } from 'react';
import PortalIndex from './portal/Index';
import DocumentIndex from './document/Index';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import './App.scss';
import { HexoDataContext } from './context';
import loadingSvg from './assert/loading.svg';

function App() {
  const [hexoData, setHexoData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/db.json').then(data => data.json()).then(data => {
      setHexoData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className='loading' ><img src={loadingSvg} /></div>
  }

  return (
    <HexoDataContext.Provider value={hexoData} >
      <Fragment>
        <Router>
          <Switch>
            <Route path="/docs">
              <DocumentIndex />
            </Route>
            <Route path="/">
              <PortalIndex />
            </Route>
          </Switch>
        </Router>
      </Fragment>
    </HexoDataContext.Provider>

  );
}

export default App;
