import React, {Component} from 'react';
import {Route,BrowserRouter} from 'react-router-dom'
import { renderRoutes } from 'react-router-config';
import './App.css';
// import io from 'socket.io-client';
import routeConfig from './routes/route.config'
class App extends Component {
  constructor(){
    super()
  }

  render(){
    return (
      <BrowserRouter>
      {renderRoutes(routeConfig)} 
      </BrowserRouter>      
    );
  }
}

export default App;
