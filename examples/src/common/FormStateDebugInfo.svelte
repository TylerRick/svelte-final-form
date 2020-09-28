<script>
  let stateProp
  export { stateProp as state}
  let values, state
  $: ({ values, ...state } = stateProp)
</script>

<pre>state.values: {JSON.stringify(values, null, 2)}</pre>
<pre>state: {JSON.stringify(state, null, 2)}</pre>
