// Based on https://github.com/devongovett/svelte-hooks/blob/master/attrs.js

export const prefixedEventRegex = /^on(:|[A-Z])/

/**
 * Partitions a props object into those that are regular, spreadable props ("rest") and those that are event handlers ("handlers").
 * @param props Props to filter
 * @returns {handlers, rest}
 */
export const partitionPropsByType = (props) => {
  let handlers = {}
  let rest = {}
  for (let key in props) {
    if (prefixedEventRegex.test(key)) {
      handlers[key] = props[key]
    } else {
      rest[key] = props[key]
    }
  }
  return { handlers, rest }
}

export const rejectEventProps = (props) => {
  const { rest } = partitionPropsByType(props)
  return rest
}

export const selectEventProps = (props) => {
  const { handlers } = partitionPropsByType(props)
  return handlers
}

export const filterEventProps = (props) => {
  let events = {}
  let restProps = {}
  for (let key in props) {
    if (prefixedEventRegex.test(key)) {
      events[key] = props[key]
    } else {
      restProps[key] = props[key]
    }
  }
  return [events, restProps]
}

// Adds listeners for the given handlers.
// use:useHandlers
export function useHandlers(element, handlers) {
  let apply = (newHandlers) => {
    for (let key in newHandlers) {
      let event = key
      let capture = false
      if (key.endsWith('Capture')) {
        capture = true
        event = event.slice(0, -7)
      }

      if (handlers[key] != null && (newHandlers[key] == null || newHandlers[key] !== handlers[key])) {
        element.removeEventListener(event, handlers[key], capture)
      }

      if (newHandlers[key] != null) {
        element.addEventListener(event, newHandlers[key], capture)
      }
    }
  }

  apply(handlers)

  return {
    update(newHandlers) {
      let update = {}
      for (let key in newHandlers) {
        if (newHandlers[key] != null && newHandlers[key] !== handlers[key]) {
          // The handler for a given event name has been changed to a new function.
          update[key] = newHandlers[key]
        }
      }

      for (let key in handlers) {
        if (handlers[key] != null && !(key in newHandlers)) {
          // The handler for a given event name has been removed.
          update[key] = undefined
        }
      }

      apply(update)
      handlers = newHandlers
    },
    destroy() {
      for (let event in handlers) {
        element.removeEventListener(event, handlers[event])
      }
    },
  }
}

export default useHandlers
