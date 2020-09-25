function whenValueChanges(init, callback, isEqual = (a, b) => a === b) {
  let prev = init;
  return (value) => {
    // console.log('whenValueChanges:', prev, "?==", value, !isEqual(prev, value))
    if (!isEqual(prev, value)) {
      callback(value);
      prev = value;
    }
  };
}

export default whenValueChanges;
