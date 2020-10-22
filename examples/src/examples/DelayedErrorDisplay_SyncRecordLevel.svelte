<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../common'
  export const exampleMeta = {
    title: 'Delayed error display (for synchronous record-level validation)',
    description: marked(`
Sometimes you want to give your user a chance to make it through a brief invalid value on their way to a valid one, e.g. a date string that needs two numbers on either side of a slash. With a simple delayed rendering component, this becomes easy. Plus, the error will disappear immediately when the user fixes the problem.
`),
    compareTo: [
      {'react-final-form': {
        // Listed on https://final-form.org/docs/react-final-form/examples but doesn't have first-class example page
        // demoPage: 'https://final-form.org/docs/react-final-form/examples/debounced-record-level-validation',
        sourceURL: 'https://github.com/final-form/react-final-form/tree/master/examples/debounced-record-level-validation',
        directAdaptation: true,
      }},
    ],
    tags: [
      'WIP',
      'delayed error display',
      'synchronous',
    ],
  }
</script>

<script>
  import { Form, Field } from "svelte-final-form"

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const onSubmit = async values => {
    await sleep(300)
    window.alert(JSON.stringify(values, 0, 2))
  }
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
  TODO
  `)}

</article>
