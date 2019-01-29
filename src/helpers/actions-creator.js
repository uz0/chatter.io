export default names => {
  let actions = {};
  let types = {};

  names.forEach(name => {
    actions[name] = function() {
      return {
        type: name,
        payload: arguments[0],
      };
    };

    types[name] = name;
  });

  return { ...actions, types };
};
