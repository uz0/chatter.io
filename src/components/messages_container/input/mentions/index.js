import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Suggestion from '@/components/suggestion';
import { actions as dropdownActions } from '@/components/dropdown';
import inputActions from '@/components/messages_container/input/actions';

class Mentions extends Component {
  openSuggestion = () => this.props.openDropdown({ uniqueId: 'suggestion-dropdown' });
  closeSuggestion = () => this.props.closeDropdown('suggestion-dropdown');

  getCurrentMentionSearch = () => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    const currentCursorPosition = textarea.selectionStart;

    if (this.props.value[currentCursorPosition - 1] === '@' && this.props.value[currentCursorPosition] === ' ') {
      return;
    }

    const start = this.props.value.substr(0, currentCursorPosition);
    const lastMentionIndex = start.lastIndexOf('@');

    if (lastMentionIndex === -1) {
      return;
    }

    const end = this.props.value.substr(lastMentionIndex + 1);
    const firstDelimiterInEnd = end.indexOf(' ');
    const nick = end.substr(0, firstDelimiterInEnd === -1 ? end.length : firstDelimiterInEnd);
    return nick;
  };

  checkIsSuggestionShown = value => {
    if (!this.props.isGroup) {
      return false;
    }

    if (!value) {
      return false;
    }

    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return false;
    }

    const currentCursorPosition = textarea.selectionStart;
    const lastChar = value[currentCursorPosition - 1];
    const prevChar = value[currentCursorPosition - 2];

    if (lastChar === '@') {
      if (value.length === 1) {
        return true;
      }

      if (prevChar === ' ') {
        return true;
      }
    }

    if (lastChar === ' ') {
      return false;
    }

    return this.props.isSuggestionShown;
  };

  setMention = nick => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    const currentCursorPosition = textarea.selectionStart;
    const lastChar = this.props.value[currentCursorPosition - 1];
    const start = this.props.value.substr(0, currentCursorPosition);

    if (lastChar === '@') {
      let end = this.props.value.substr(currentCursorPosition);

      if (end.length > 0 && end[0] !== ' ') {
        end = ` ${end}`;
      }

      const value = `${start}${nick}${end}`;
      this.props.setText(value);
      this.closeSuggestion();
      textarea.focus();
      return;
    }

    const lastMentionIndex = start.lastIndexOf('@');

    if (lastMentionIndex !== -1) {
      const start = this.props.value.substr(0, lastMentionIndex);
      let end = this.props.value.substr(lastMentionIndex);
      const firstDelimiterInEnd = end.indexOf(' ');

      if (firstDelimiterInEnd !== -1) {
        end = end.substr(firstDelimiterInEnd);
      } else {
        end = '';
      }

      const value = `${start}@${nick}${end}`;
      this.props.setText(value);
      this.closeSuggestion();
      textarea.focus();
      return;
    }
  };

  workWithMentionsShown = value => {
    const isShown = this.checkIsSuggestionShown(value);

    if (isShown === this.props.isSuggestionShown) {
      return;
    }

    if (isShown) {
      this.openSuggestion();
      return;
    }

    this.closeSuggestion();
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.workWithMentionsShown(nextProps.value);
    }
  }

  render() {
    if (!this.props.isSuggestionShown) {
      return null;
    }

    const currentMentionSearch = this.getCurrentMentionSearch();

    return <Suggestion
      subscription_id={this.props.subscription_id}
      onSelect={this.setMention}
      search={currentMentionSearch}
      onClose={this.closeSuggestion}
      className={this.props.className}
    />;
  }
}

export default compose(
  connect(
    (state, props) => ({
      value: state.input.value,
      isGroup: get(state.subscriptions.list[props.subscription_id], 'group.type', '') === 'room',
      isSuggestionShown: get(state.dropdown, 'suggestion-dropdown.isShown', false),
    }),

    {
      setText: inputActions.setText,
      openDropdown: dropdownActions.openDropdown,
      closeDropdown: dropdownActions.closeDropdown,
    },
  ),
)(Mentions);
