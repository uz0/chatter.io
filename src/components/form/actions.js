const types = {
  formChange: 'formChange',
  formReset: 'formReset',
};

const formChange = (model, data) => ({
  type: types.formChange,
  model,
  data,
});

const formReset = model => ({
  type: types.formReset,
  model,
});

export default {formChange, formReset, types};
