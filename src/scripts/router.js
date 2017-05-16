import Backbone from 'backbone';

class Router extends Backbone.Router {

  get routes() {
    return {
      ''       : 'splash',
      'admin'  : 'admin',
    }
  }

  splash() {
    this.current = 'splash';
  }
  addContent() {
   this.current = 'admin';
 }
  initialize() {
    Backbone.history.start();
  }
}

export default Router;
