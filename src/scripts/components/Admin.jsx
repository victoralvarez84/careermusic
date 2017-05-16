import React from 'react';
import Parse from 'parse';
import Backbone from 'backbone';


export default class Admin extends React.Component {
   handleSubmit = () => {
     Backbone.history.navigate( `/admin`, true);
   }

  render () {
    return
    <div>
    <h1>HELLO WORLD!!</h1>
      </div>


  }
}

export default Admin;
