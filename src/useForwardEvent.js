import { createEventDispatcher } from 'svelte'

// Note: This can only forward a CustomEvent, unfortunately, not an event with the original type (InputEvent), so the consumer of this must unwrap the event from event.detail
export const useForwardEvent = () => {
  const dispatch = createEventDispatcher();

  const forwardEvent = (event, { type } = { type: event.type }) => {
    // console.log('forwarding', event)
    dispatch(type, event);
  }
  return forwardEvent
}

export default useForwardEvent
