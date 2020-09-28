import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import pkg from "./package.json";

export default [
  {
    external: ['svelte/internal', 'svelte', 'final-form'],
    input: "src/index.js",
    output: [
      { file: pkg.module, format: "es" },
      { file: pkg.main, format: "umd", name: pkg.name },
    ],
    plugins: [resolve(), svelte()],
  },
];
