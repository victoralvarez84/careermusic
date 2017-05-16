window.$ = window.jQuery = require('jquery');
require('bootstrap');

import Parse from 'parse';

Parse.initialize(
  "W0Wi8FP9fuG5g1TfWXE7AABAeDd0ZgIYRjlNT2pL",
  "QzEJNsSZ8M2hP5hXZ3qgtFjmNTuPJ8PkXWLrqk1o"
);

import React from 'react';
import ReactDOM from 'react-dom';

import Router from './router';
import App from './components/App';

$(() => {
  let router = new Router();

  ReactDOM.render(
    <App router={router} />,
    document.getElementById('app')
  );
});

window.Parse = Parse;
