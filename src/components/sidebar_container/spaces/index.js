import React, { Component, Fragment } from 'react';
import Link from '@/components/link';
import Icon from '@/components/icon';
import Section from '@/components/sidebar_container/section';
import style from './style.css';

class Spaces extends Component {
  renderSpace = ({ item }) => {
    return <Link to="/" key={item} className={style.space}>
      <Icon name="hashtag" />
      <p className={style.name}>general</p>

      {item === 3 &&
        <div className={style.point} />
      }
    </Link>;
  };

  render() {
    return <Fragment>
      <Section
        items={[1,2,3,4,5]}
        title="Spaces"
        emptyMessage="There is no spaces yet"
        renderItem={this.renderSpace}
        className={style.section}
      />
    </Fragment>;
  }
}

export default Spaces;
