// React
import React, { Component } from 'react';

// Apollo
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { createNetworkInterface } from 'apollo-client';

// App.Components
import Repository from './repository';

// Auth
import { login as githubLogin } from './githubLogin';

// Global.Auth
let TOKEN = null;

// Global.Apollo
const networkInterface = createNetworkInterface('https://api.github.com/graphql');

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};  // Create the header object if needed.
    }

    // Send the login token in the Authorization header
    req.options.headers.authorization = `Bearer ${TOKEN}`;
    next();
  }
}]);

const client = new ApolloClient({
  networkInterface,
});

// App
export default class App extends Component {
  constructor() {
    super();
    this.state = { login: false };
  }

  login = (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    if (!username || !password) {
      throw new Error('Please enter credentials');
    }
    githubLogin(username, password).then(token => {
      TOKEN = token;
      this.setState({ login: true });
    });
  }

  routeForRepository(login, name) { return {
      title: `${login}/${name}`,
      component: Repository,
      login,
      name
  }}

  setUsername = (e) => {
    this.setState({ username: e.target.value });
  }

  setPassword = (e) => {
    this.setState({ password: e.target.value });
  }

  render() {
    // Log in state
    if (!this.state.login) {
      return (
        <form onSubmit={this.login} style={{ margin: 100 }}>
          <h2>GitHub Login</h2>
          <label style={{ display: 'block' }}>
            Username
            <input
              type="text"
              name="username"
              onChange={this.setUsername}
              style={{ margin: 12 }}
            />
          </label>
          <label style={{ display: 'block' }}>
            Password
            <input
              type="password"
              name="password"
              onChange={this.setPassword}
              style={{ margin: 12 }}
            />
          </label>
          <button type="submit">Go</button>
        </form>
      );
    }

    // Logged in, fetch from Github
    return (
      <ApolloProvider client={client}>
        <Repository {...this.routeForRepository('facebook', 'react')} />
      </ApolloProvider>
    );
  }
}
