<script type="ts">
  import { useField } from "svelte-final-form"
  export let name: any

  const field = useField(
    name,
    { subscription: { touched: true, error: true }}
  )
  let input, meta
  $: ({
     input,
     meta,
  } = $field)

  $: error = (meta.touched && meta.error) ? meta.error : meta.submitError
</script>

<!-- <pre>{input.name}: {error}; {JSON.stringify(input)}</pre> -->
{#if error}
  <div class="errors error_message_on" data-model-name={input.name}>
    <div {...$$restProps}>{error}</div>
  </div>
{/if}
