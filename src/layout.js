import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Notification from '@/components/notification';
import Icon from '@/components/icon';
import style from './layout-style.css';

class Layout extends Component {
  renderLayout() {
    return <Fragment>
      { this.props.children }
      <Notification />
    </Fragment>;
  }

  renderError() {
    const detailsCode = this.props.error.details && JSON.stringify(this.props.error.details, null, 2);
    const detailsString = this.props.error.details && this.props.error.details.toString();
    const argumentsCode = JSON.stringify(this.props.error.request.arguments, null, 2);

    return <div className={style.error}>
      <Icon name="warning" />
      <h1>Error</h1>

      {this.props.error.request &&
        <Fragment>
          <h2 className={style.title}>Request</h2>
          <h3 className={style.subtitle}>Name</h3>
          <p className={style.normal_text}>{this.props.error.request.name}</p>
          <h3 className={style.subtitle}>Arguments</h3>
          <pre className={style.normal_text}>{argumentsCode}</pre>
        </Fragment>
      }

      {this.props.error.details &&
        <Fragment>
          <h2 className={style.title}>Details</h2>

          {detailsCode !== '{}' &&
            <pre className={style.error_text}>{detailsCode}</pre>
          }

          {detailsCode === '{}' &&
            <p className={style.error_text}>{detailsString}</p>
          }
        </Fragment>
      }
    </div>;
  }

  render() {
    if (this.props.error) {
      return this.renderError();
    }

    return this.renderLayout();
  }
}

export default compose(
  connect(
    state => ({
      error: state.error,
    }),
  ),
)(Layout);
