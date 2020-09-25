<script>
  // console.log('FieldArray')

  // This is a port of FieldArray from react-final-form-arrays
  // Compare to/reference:
  // - react-final-form-arrays/src/useFieldArray.js
  // - react-final-form-arrays/src/FieldArray.js

  import useFieldArray from './useFieldArray'

  export let name
  export let subscription = undefined
  export let defaultValue = undefined
  export let initialValue = undefined
  export let isEqual = undefined
  export let validate = undefined

  const fieldsStore = useFieldArray(
    name,
    {
      subscription,
      defaultValue,
      initialValue,
      isEqual,
      validate,
      ...$$restProps,
    }
  )

  let fields, meta
  $: ({
    fields,
    meta,
  } = $fieldsStore)
</script>

<slot fields={fields} meta={meta} />
