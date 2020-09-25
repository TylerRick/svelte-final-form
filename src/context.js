import { getContext, setContext } from "svelte";

const key = {}

// Simple setter/getter
export const setFormContext = context => {
  setContext(key, context)
}
export const getFormContext = () => {
  return getContext(key)
}

export default key
