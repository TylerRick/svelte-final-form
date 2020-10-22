<script>
  import marked from 'marked'

  export let example
  // Most of the time, we can just use a codesandbox URL based on the github URL. When that is not the case, provide sandboxURL.
  if (/github\.com/.test(example.sourceURL)) {
    example.sandboxURL = example.sandboxURL || example.sourceURL.replace('https://github.com/', 'https://codesandbox.io/s/github/')
  }
</script>

{#if example.demoPage}
  <a href={example.demoPage}>Example</a>
{/if}
{#if example.sourceURL}
  (<a href={example.sourceURL}>Source</a>)
{/if}
{#if example.sandboxURL}
  (<a href={example.sandboxURL}>Sandbox</a>)
{/if}
