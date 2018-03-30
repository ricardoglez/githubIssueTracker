import React from "react";
import ReactDOM from "react-dom";

import {
  History,
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  browserHistory
} from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import createBrowserHistory from 'history/createBrowserHistory'
import Utils from './utils/Utils';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';

import Tracker from './components/Tracker';

import Login from './components/Login';

const accessToken = Utils.getToken();

const graphUrl = new HttpLink({uri:"https://api.github.com/graphql"});
// console.log(firebase);

// const gitHubPersonalToken = '6393d6e949abfd5e22f1c35b195de0c0b3acd0c3';

/**
* This function handles the authorization HEaders to handle github Data with GraphQL
* it uses the setContext function and the Personal Token
**/
let authLink = null;


if(accessToken){
  authLink = setContext((_,{ headers }) => {
    return{
      headers:{
        ...headers,
        authorization:`Bearer ${accessToken}`,
      }
    }
  })
}

ReactDOM.render(
  <Router >
    <Switch>
      <Route exact path='/tracker' component={ Tracker }/>
      <Route exact path='/ingresar' component={ Login }/>
    </Switch>
  </Router>,
  document.getElementById('app')
);

if (module.hot) {
  module.hot.dispose(function () {
    // module is about to be replaced
  });
module.hot.accept(function () {
    // module or one of its dependencies was just updated
  });
}
