<script>
  import examples, { descriptions } from './examples'
</script>

<h1>svelte-final-form examples</h1>

<nav>
  <ul>
    {#each Object.entries(examples) as [name, _component]}
      <li>
        <a href="/{name}">{name}</a>
        {@html descriptions[name]}
      </li>
    {/each}
  </ul>
</nav>
