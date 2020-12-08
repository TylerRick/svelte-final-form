export const inputPropsForSmuiTextfield = ({ name, ...input }) => {
  return {
    input$name: name,
    'input$aria-controls': `helper-text-${name}`,
    'input$aria-describedby': `helper-text-${name}`,
    ...input,
  }
}

export const inputPropsForSmuiRadio = ({ input: { name, value: staticValue, checked, ...input }, state: { value } }) => {
  // The current version of svelte-material-ui doesn't let you set `checked` directly; you have to set it indirectly via a `group` prop.
  // By contrast, in [the rewrite](https://github.com/svelte-material-ui-test/core/blob/master/packages/radio/src/Radio.svelte), the `checked` prop _will_ be used and no `group` prop provided.
  return {
    input$name: name,
    group: value,
    value: staticValue,
    ...input,
  }
}

export const inputPropsForSmuiCheckbox = ({ name, ...input }) => {
  return {
    input$name: name,
    ...input,
  }
}
