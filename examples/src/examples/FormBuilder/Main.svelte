<script context="module">
  import marked from 'marked'
  import { ExampleHeader, FormStateDebugInfo } from '../../common'
  export const exampleMeta = {
    title: 'Form Builder',
    description: marked(`

A little demo app to show how one form can be used to build another in real time.
`),
    compareTo: [
      {'react-final-form': {
        // The linked-to demo page is missing/broken:
        //   demoPage: 'https://web.archive.org/web/20200804191510/https://builder-demo.final-form.org/'
        // but the Sandbox from GitHub works:
        //   https://codesandbox.io/s/github/final-form/builder-demo
        sourceURL: 'https://github.com/final-form/builder-demo'
      }},
    ],
    tags: [
      'WIP',
      'form builder ',
    ],
  }
</script>

<script>
</script>

<article class="final-form-example">
  <ExampleHeader {exampleMeta} />
  {@html marked(`
  `)}
</article>
