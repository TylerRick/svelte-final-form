<script>
  console.log('our UsesContext')
  import {setContext, getContext } from 'svelte'

  import { onDestroy, onMount } from "svelte";
  onMount(() => {
    console.log('UsesContext: onMount')
  });

  const key = {}
  setContext(key, 'context')
  let context = getContext(key)
</script>
our UsesContext: {context}
