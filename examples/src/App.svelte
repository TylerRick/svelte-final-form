<script>
  import router from 'page'

  import Home from './Home.svelte'
  import examples from './examples'

  let page
  router('/', () => page = Home)
  for (const [name, component] of Object.entries(examples)) {
    router(`/${name}`, () => page = component)
  }
  router.start()
</script>

<nav>
  <a href="/">Home</a> |
  {#each Object.entries(examples) as [name, _component]}
    <a href="/{name}">{name}</a> |{' '}
  {/each}
</nav>

<main>
  <svelte:component this={page} />
</main>
