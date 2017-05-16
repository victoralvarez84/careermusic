import React from 'react';
import Parse from 'parse';
import Navigation from './Navigation';
import Splash from './Splash';
import Icon from './Icon';
import Admin from './Admin';




class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUser: Parse.User.current(),
      currentRoute: props.router.current
    }
  }

  componentWillMount() {
    this.props
      .router
      .on('route', this.onRoute);
  }

  componentWillUnmount() {
    this.props
      .router
      .off('route', this.onRoute);
  }

  onRoute = () => {
    $("#navbar").collapse('hide');
       this.setState({
         currentUser: Parse.User.current(),
         currentRoute: this.props.router.current
       });
     }


  render() {
    let currentView;

    console.log(this.state);

    switch (this.state.currentRoute) {
      case 'splash' :
      currentView = <Splash />;
      break;
      case 'admin' :
      currentView = <Admin />;
      break;
      default :
      currentView = <Splash/>;
    }

    return (
      <div>
        <Navigation current={this.state.currentRoute} currentUser={this.state.currentUser}/>
        {currentView}
        <footer className="footer">
        <div className="footerContainer">
        <p>&copy; CAREER 2016</p>
        <div className="footerSocial">
          <a href="https://www.facebook.com/Careerfl/?ref=br_rs">FACEBOOK</a>
          <a href="https://www.instagram.com/career.band/">INSTAGRAM</a>
          <a href="https://www.youtube.com/watch?v=8MwwOmGGnSY">YOUTUBE</a>
        </div>
        </div>
        </footer>
    </div>
    );
  }
}

export default App;
