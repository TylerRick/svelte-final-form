import * as all from './all'

const examples = Object.entries(all).reduce(
  (result, [key, value]) => {
    if (/_meta/.test(key)) {
      key = key.replace(/_meta/, '')
      result[key].meta = value
      // result[key] = result[key] || {}
      // const {title, description} = value
      // Object.assign(result[key],
      //   {title, description})
    } else {
      result[key] = value
    }
    return result
  },
  {}
)

export default examples
