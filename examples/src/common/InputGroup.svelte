<script type="ts">
  /**
   * This is a wrapper for Input that also adds:
   * - a <label> (optional)
   * - <FieldErrors>
   * Pass this to Field's slot (or pass component={InputGroup} if you want all of this instead of just an Input.
   * 
   * This is a more advanced variation of examples/src/examples/FocusFirstError/InputRow.svelte that adds:
   * - <label for={input.id}>
   * - <FieldErrors> which also takes into account submitError
   * - forward/bubble events emitted by Input
   * - export let value to allow parent to bind to it
   */

  import { Input, useForwardEvent } from 'svelte-final-form'
  const forwardEvent = useForwardEvent()
  import { FieldErrors } from '.'

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
<FieldErrors {field} />
