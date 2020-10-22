<script>
  import marked from 'marked'
  import ExampleHeader_ExampleLinks from './ExampleHeader_ExampleLinks.svelte'

  export let exampleMeta

  let other

  // TODO: import from 'all'; list any examples that point to this one as a variantOf
</script>

{@html marked(`
# ${exampleMeta.title}

${exampleMeta.description}
`)}

{#each exampleMeta.compareTo || [] as compareTo}
  {#if compareTo.variantOf}
    {@html marked(`This is a variant of [${compareTo.variantOf}](/${compareTo.variantOf})`)}
  {/if}
  <!-- https://github.com/sveltejs/svelte/issues/4614#issuecomment-605971618 -->
  {#if other = compareTo['react-final-form']}
    <p>
      Compare to react-final-form:
      <ExampleHeader_ExampleLinks example={other} />
    </p>
  {/if}
{/each}

