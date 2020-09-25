<script>
  /**
   * This is a wrapper for <input>/<textarea>/<select> that uses `field` to get the props and event handlers to use for its <input>/etc. element.
   */

  import { useForwardEvent } from '.'
  const forwardEvent = useForwardEvent()

  export let field
  export let component = 'input'

  // Read-only/const
  export let element = undefined
  let input, meta, handlers
  $: ({input, meta, handlers} = field)
</script>

<!-- To do: find a way to remove duplication. I would use <svelte:component> but strings can't be used as components like they can in React -->
{#if component === 'input'}
  <input
    bind:this={element}
    {...input}
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
    {...$$restProps}
    {...input}
    on:blur={handlers.onBlur}
    on:focus={handlers.onFocus}
    on:input={(e) => {
      forwardEvent(e)
      handlers.onChange(e)
    } }
    on:change
  >
    <slot {field} />
  </select>
{/if}
