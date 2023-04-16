const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const babel = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");

module.exports = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "amd",
    sourcemap: true,
    amd: {
      forceJsExtensionForImports: true,
    },
  },
  plugins: [
    commonjs(),
    typescript(),
    nodeResolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
      preventAssignment: true,
    }),
    babel(),
    serve({
      verbose: true,
      contentBase: ["dist"],
      host: "localhost",
      port: 3001,
    }),
    livereload({ watch: ["dist"] }),
  ],
  external: ["react"],
};
