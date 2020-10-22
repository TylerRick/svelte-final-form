<script>
  // A fairly direct port of InputRow from https://codesandbox.io/s/github/final-form/react-final-form/tree/master/examples/focus-first-error?file=/index.js
  // See InputGroup for a more advanced/flexible input wrapper.

  import { Input } from 'svelte-final-form'
  export let field
  export let label

  let input, active, error, touched
  $: ({input, meta: { active, error, touched }} = field)
</script>

<div class:active={active}>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label>{label}</label>
  <Input
    {field}
    placeholder={label}
    {...$$restProps}
  />
  {#if error && touched}
    <span>{error}</span>
  {/if}
</div>
