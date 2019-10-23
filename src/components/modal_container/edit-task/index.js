import React from 'react';
import Modal from '@/components/modal';
import Content from './content';
import Comments from './comments';
import style from './style.css';

const EditTask = ({
  close,
  options,
}) => {
  return <Modal
    close={close}
    className={style.modal}
    wrapClassName={style.wrapper}
  >
    <Content
      close={close}
      {...options.task_id ? { task_id: options.task_id } : {}}
      {...options.subscription_id ? { subscription_id: options.subscription_id } : {}}
    />

    {options.task_id &&
      <Comments />
    }
  </Modal>;
};

export default EditTask;
