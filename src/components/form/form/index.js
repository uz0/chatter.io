import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import get from 'lodash/get';
import { uid } from '@/helpers';
import Button from '@/components/button';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Form extends Component {
  state = {
    hasErrors: false,
    hasNotTouched: true,
  };

  componentWillReceiveProps(nextProps) {
    let hasErrors = false;
    let hasNotTouched = false;

    Object.keys(nextProps.formData).forEach(key => {
      if (nextProps.formData[key].error) {
        hasErrors = true;
      }

      if (!nextProps.formData[key].isTouched && nextProps.formData[key].isRequired && !nextProps.formData[key].value) {
        hasNotTouched = true;
      }
    });

    this.setState({ hasErrors, hasNotTouched });
  }

  render() {
    return <form className={cx('form', this.props.className)}>
      { this.props.children }
      {this.props.error && <div className={style.divider} />}
      {this.props.error && <p className={style.error}>{ this.props.error }</p>}

      {this.props.actions && <div className={style.actions}>
        {this.props.actions.map(action => {
          const Action = props => props.to
            ? <Link {...props}>{ props.text }</Link>

            : <Button
              {...props}
              {...!props.type ? { type: 'button' } : {}}
              disabled={props.type === 'submit' && (this.props.disabled || this.state.hasErrors || this.state.hasNotTouched)}
            />;

          return <Action key={uid()} {...action} />;
        })}
      </div>}
    </form>;
  }
}

export default connect(
  (state, props) => ({
    formData: { ...get(state.forms, props.model) },
  }),
)(Form);
