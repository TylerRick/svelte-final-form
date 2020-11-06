<script type="ts">
  export let field: any
  let input, meta, handlers
  $: ({input, meta, handlers} = field)
  $: error = (meta.touched && meta.error) ? meta.error : meta.submitError
</script>

{#if error}
  <div class="error-messages">
    <div {...$$restProps}>{error}</div>
  </div>
{/if}

<style>
  .error-messages {
    color: red;
  }
</style>
