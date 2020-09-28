<script type="ts">
  /**
   * This is a wrapper for Input that also adds:
   * - a <label> (optional)
   * - <ErrorMessages>
   * Pass this to Field's slot if you want those instead of just a Input.
   */

  // TODO: rename to InputGroup

  import { Input, useForwardEvent } from 'svelte-final-form'
  const forwardEvent = useForwardEvent()
  import { ErrorMessages } from '.'

  export let field: any
  export let label: string = undefined

  // Read-only/const. (That is, updating this from parent will have no effect.)
  export let value = undefined

  let input
  $: ({input} = field)
</script>

{#if label}
  <label for={input.name}>{label}</label>
{/if}

<slot {field}>
  <Input
    {field}
    {...$$restProps}
    on:input={(e) => {
      forwardEvent(e)
      value = e.detail.target.value
    } }
  />
</slot>

<!-- <pre>{JSON.stringify(meta, null, 2)}</pre> -->
<ErrorMessages {field} />
