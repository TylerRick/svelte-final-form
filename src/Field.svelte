<script>
  import { useField, Input, useForwardEvent } from '.'
  const forwardEvent = useForwardEvent()

  export let name
  export let subscription = undefined
  export let validate = undefined
  export let component = 'input'

  // Read-only/const. (That is, updating this from parent will have no effect.)
  // Note: This is not available if you override the slot fallback, because the on:input arrives at the consumer's slot contents but doesn't get forwarded to *this* component. You would have to bind to the value of the input passed into the slot instead.
  // export let internalValue = undefined
  export let element = undefined

  // console.log('Field', name, $$restProps)
  const fieldStore = useField(name, {
    subscription,
    validate,
    component,
    ...$$restProps,
  })
  $: field = $fieldStore
</script>

{#if component === 'input' || component === 'textarea'}
  <slot {field}>
    <Input
      {component}
      {field}
      {...$$restProps}
      on:input={(e) => {
        // console.log('forwarding', e)
        forwardEvent(e)
        // internalValue = e.detail.target.value
      }}
      bind:element
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
        // internalValue = e.detail.target.value
      }}
      bind:element
    >
      <slot {field} />
    </Input>
  </slot>
{:else if component}
  <svelte:component this={component} {field} {...$$restProps} />
{:else}
  <slot {field} />
{/if}
