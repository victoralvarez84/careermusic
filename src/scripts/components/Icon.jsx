import React from 'react';

class Icon extends React.Component {

  render() {
    let classes = [
      'fa',
      'fa-' + this.props.type
    ];

    return <i className={classes.join(' ')}></i>;
  }
}

export default Icon;
