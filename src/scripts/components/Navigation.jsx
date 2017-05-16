import React from 'react';
import Parse from 'parse';
import Backbone from 'backbone';
import Icon from './Icon';

class NavigationItem extends React.Component {

  render() {
    let className;
    if (this.props.current)
      className = 'active';

    return (
      <li className={className}>
        <a href={this.props.to}>
          {this.props.icon
            ? <Icon type={this.props.icon}/>
            : ''}
          {' '}
          {this.props.label}
        </a>
      </li>
    );
  }
}

class SessionNavigation extends React.Component {

  handleSignOut = () => {
    Parse.User.logOut();
    Backbone.history.navigate('/', true);
  }

  handleSignIn = (event) => {
    event.preventDefault();
    Parse.User.logIn(this.refs.username.value, this.refs.password.value, {
      success: function(user) {
        Backbone.history.navigate('/info', true);
      },
      error: function(user, error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  render() {
    if (this.props.user) {

      $(document).ready(function(){

	/* Hamburger menu */
	$('.open-button').click(function(){
		$(this).toggleClass('open');
	});

	/* Menu fade/in out on mobile */
	$(".open-button").click(function(e){
		e.preventDefault();
	    $(".mobile-menu").fadeToggle();
	});

});
      return (
        <ul className = "nav navbar-nav navbar-right">
          <li>
            <a href="#" onClick={this.handleSignOut} >
              <Icon type="user"/>
              {' '}
              Sign Out
            </a>
          </li>
        </ul>
      )
    } else {
      return (
        <div>


        </div>
      );
    }
  }
}

class Navigation extends React.Component {
  componentDidMount() {
}


  render() {
  return (
<div></div>
  );
    }
  }

  export default Navigation;
