/* Validators, return true if parameter is not valid */

export default {
  email: value => value && !value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  required: value => !value,
  minLength: length => value => value && value.length < length,
  contains: char => value => value && value.indexOf(char) !== -1,
  fileMaxSize: size => file => file.size > size,
  fileType: type => file => file.type.indexOf(type) !== 0,

  fileExtensions: extensions => file => {
    let isContainsExtensions = false;

    extensions.forEach(extension => {
      if (file.type.indexOf(`/${extension}`) !== -1) {
        isContainsExtensions = true;
      }
    });

    return !isContainsExtensions;
  },
};
