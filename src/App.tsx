import React, { Fragment, useState, useEffect } from 'react';
import PortalIndex from './portal/Index';
import DocumentIndex from './document/Index';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
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
            <Redirect exact from="/" to="/docs/react/INTRO.html" />
            <Route path="/">
              <DocumentIndex />
            </Route>
          </Switch>
        </Router>
      </Fragment>
    </HexoDataContext.Provider>

  );
}

export default App;
