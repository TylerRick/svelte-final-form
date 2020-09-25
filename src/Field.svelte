<script>
  // console.log('Field')
  import useField from './useField'

  export let name
  export let subscription = undefined
  export let validate = undefined

  const field = useField(
    name,
    {
      subscription,
      validate,
      ...$$restProps,
    }
  )

  let input, meta
  $: ({
    input,
    meta,
  } = $field)
</script>

<slot {input} {meta} />
