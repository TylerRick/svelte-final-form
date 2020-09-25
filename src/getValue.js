const getSelectedValues = options => {
  const result = []
  if (options) {
    for (let index = 0; index < options.length; index++) {
      const option = options[index]
      if (option.selected) {
        result.push(option.value)
      }
    }
  }
  return result
}

const getValue = (
  event,
  currentValue,
  valueProp,
) => {
  const { target: { type, value, checked } } = event
  switch (type) {
    case 'checkbox':
      if (valueProp !== undefined) {
        // we are maintaining an array, not just a boolean
        if (checked) {
          // add value to current array value
          return Array.isArray(currentValue)
            ? currentValue.concat(valueProp)
            : [valueProp]
        } else {
          // remove value from current array value
          if (!Array.isArray(currentValue)) {
            return currentValue
          }
          const index = currentValue.indexOf(valueProp)
          if (index < 0) {
            return currentValue
          } else {
            return currentValue
              .slice(0, index)
              .concat(currentValue.slice(index + 1))
          }
        }
      } else {
        // it's just a boolean
        return !!checked
      }
    case 'select-multiple':
      return getSelectedValues(event.target.options)
    default:
      return value
  }
}

export default getValue
