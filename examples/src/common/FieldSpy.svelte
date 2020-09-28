<script type="ts">
  import { useField } from "svelte-final-form"
  export let name: any

  const field = useField(
    name
  )
  // $: console.log($field.input.value)
</script>

<pre>{$field.input.name}: {JSON.stringify($field, null, 2)}</pre>
