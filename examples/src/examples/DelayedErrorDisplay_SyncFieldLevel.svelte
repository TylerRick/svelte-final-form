<script context="module">
  import marked from 'marked'
  export const exampleMeta = {
    title: 'Delayed error display (for synchronous field-level validation)',
    description: marked(`
Sometimes you want to give your user a chance to make it through a brief invalid value on their way to a valid one, e.g. a date string that needs two numbers on either side of a slash. With a simple delayed rendering component, this becomes easy. Plus, the error will disappear immediately when the user fixes the problem.
`),
    // Listed on https://final-form.org/docs/react-final-form/examples but doesn't have first-class example page
    basedOnUrl: 'https://codesandbox.io/s/react-final-form-synchronous-field-level-errors-debounced-9k83l?file=/src/index.js'
  }
</script>

<article class="final-form-example">
  {@html marked(`
  TODO
  `)}
</article>
