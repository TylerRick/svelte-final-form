// Based on https://github.com/devongovett/svelte-hooks/blob/master/attrs.js

export const eventRegex = /^on(:|[A-Z])/

/**
 * Partitions a props object into those that are regular, spreadable props ("rest") and those that are event handlers ("handlers").
 * @param props Props to filter
 * @returns {rest, handlers}
 */
export const partitionPropsByType = (props) => {
  let handlers = {} as any
  let rest = {} as any
  for (let key in props) {
    if (eventRegex.test(key)) {
      handlers[key] = props[key]
    } else {
      rest[key] = props[key]
    }
  }
  return {rest, handlers}
}

export const rejectEventProps = (props) => {
  const {rest} = partitionPropsByType(props)
  return rest
}

export const selectEventProps = (props) => {
  const {handlers} = partitionPropsByType(props)
  return handlers
}
