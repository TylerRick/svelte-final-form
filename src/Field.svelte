<script>
  // console.log('Field')
  import { default as Input } from './Input.svelte'
  import { default as useField } from './useField'
  import { useForwardEvent } from './useForwardEvent.js'
  const forwardEvent = useForwardEvent()

  export let name
  export let subscription = undefined
  export let validate = undefined
  export let component = 'input'

  // Read-only/const. (That is, updating this from parent will have no effect.)
  // TODO: This is not available if you override the slot fallback, because the on:input arrives at the consumer's slot contents but doesn't get forwarded to this component.
  export let value = undefined

  const fieldStore = useField(
    name,
    {
      subscription,
      validate,
      ...$$restProps,
    }
  )
  $: field = $fieldStore
</script>

{#if component === 'input' || component === 'textarea'}
  <slot {field}>
    <Input
      {component}
      {field}
      {...$$restProps}
      on:input={(e) => {
        forwardEvent(e)
        value = e.detail.target.value
      } }
    />
  </slot>
{:else if component === 'select'}
  <slot {field} name="component">
    <Input
      {component}
      {field}
      {...$$restProps}
      on:input={(e) => {
        forwardEvent(e)
        value = e.detail.target.value
      } }
    >
      <slot {field} />
    </Input>
  </slot>
{:else}
  <slot {field} />
{/if}
