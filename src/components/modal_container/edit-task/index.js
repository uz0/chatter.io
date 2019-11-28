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
      {...options.organization_id ? { organization_id: options.organization_id } : {}}
      {...options.task_id ? { task_id: options.task_id } : {}}
      {...options.subscription_id ? { subscription_id: options.subscription_id } : {}}
      {...options.is_input ? { is_input: options.is_input } : {}}
    />

    {options.task_id &&
      <Comments task_id={options.task_id} />
    }
  </Modal>;
};

export default EditTask;
