<script>
  import examples from './examples'
  const title = (example) => example?.meta?.title || example.name

  // TODO: Make side nav permanently show so you can quickly nav between examples
  // TODO: Show tags as chips; click on a tag to filter by it
  // TODO: Sort based on meta.directComparisonTo: 'react-final-form' (or svelte-forms-lib, or formik, etc.) instead
</script>

<h1>svelte-final-form examples</h1>

<nav>
  {#each Object.entries(examples) as [name, example]}
    <h3><a href="/{name}">{@html title(example)}</a></h3>
    {@html example.meta && example.meta.description || ''}
  {/each}
</nav>
