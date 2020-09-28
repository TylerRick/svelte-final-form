<script>
  /**
   * This is a wrapper for <input> or <select> that uses `field` to get the props and event handlers for its <input>.
   */

  import { useForwardEvent } from '.'
  const forwardEvent = useForwardEvent()

  export let field
  export let component = 'input'
  export let id = undefined

  export let element = undefined
  let input, meta, handlers
  $: ({input, meta, handlers} = field)
  $: id = id || input.name
</script>

<!-- To do: find a way to remove duplication. I would use <svelte:component> but strings can't be used as components like they can in React -->
{#if component === 'input'}
  <input
    bind:this={element}
    {...input}
    {id}
    on:blur={handlers.onBlur}
    on:focus={handlers.onFocus}
    on:input={(e) => {
      forwardEvent(e)
      handlers.onChange(e)
    } }
    on:change
    {...$$restProps}
  />
{:else if component === 'textarea'}
  <textarea
    bind:this={element}
    {...input}
    {id}
    on:blur={handlers.onBlur}
    on:focus={handlers.onFocus}
    on:input={(e) => {
      forwardEvent(e)
      handlers.onChange(e)
    } }
    on:change
    {...$$restProps}
  />
{:else if component === 'select'}
  <select
    bind:this={element}
    {...input}
    {id}
    on:blur={handlers.onBlur}
    on:focus={handlers.onFocus}
    on:input={(e) => {
      forwardEvent(e)
      handlers.onChange(e)
    } }
    on:change
    {...$$restProps}
  >
    <slot {field} />
  </select>
{/if}
