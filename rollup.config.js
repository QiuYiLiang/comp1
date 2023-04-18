const fs = require("fs");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const babel = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const path = require("path");

const ELEMENT_TYPES = ["react"];

const EXTERNAL = ["react"];

const development = process.env.NODE_ENV === "development";
const port = process.env.PORT ?? 3001;

clean();

function clean() {
  fs.rmdirSync("dist", { recursive: true });
}

function getRollupOptions({
  input,
  outputDir,
  packageJsonPath,
  packageDir,
  isTs = true,
}) {
  const rollupOptions = {
    input: { index: input },
    output: {
      dir: outputDir,
      format: "amd",
      sourcemap: true,
      amd: {
        forceJsExtensionForImports: true,
      },
    },
    globals: {
      preact: "hhh",
    },
    plugins: [
      commonjs(),
      nodeResolve(),
      replace({
        "process.env.NODE_ENV": development,
        preventAssignment: true,
      }),
      peerDepsExternal({
        packageJsonPath,
      }),
      babel(),
    ],
    external: EXTERNAL,
  };
  if (isTs) {
    rollupOptions.plugins.push(
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
          include: [packageDir],
        },
      })
    );
  }
  if (development) {
    rollupOptions.plugins.push(livereload({ watch: ["dist"] }));
  }
  return rollupOptions;
}

function getPackages() {
  const packages = [];
  const commonPackageNames = [];

  ELEMENT_TYPES.forEach((type) => {
    fs.readdirSync(type).forEach((f) => {
      const packageDir = path.join(type, f);
      if (!fs.statSync(packageDir).isDirectory()) {
        return;
      }
      const packageJsonPath = path.resolve(packageDir, "package.json");

      const { name, version, peerDependencies = {} } = require(packageJsonPath);

      const peerDependenciesNames = Object.keys(peerDependencies);

      const distDir = path.join("dist", packageDir);

      commonPackageNames.push(
        ...peerDependenciesNames
          .filter(
            (name) =>
              !commonPackageNames.find(
                ({ commonPackageName }) => commonPackageName === name
              )
          )
          .map((commonPackageName) => {
            return {
              packageDir,
              commonPackageName,
            };
          })
      );

      const meta = {
        commonPackages: peerDependenciesNames,
      };

      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      fs.writeFileSync(path.join(distDir, "meta.json"), JSON.stringify(meta));

      const rollupOptions = getRollupOptions({
        input: path.join(packageDir, "index.ts"),
        outputDir: distDir,
        packageJsonPath,
        packageDir,
      });

      packages.push(rollupOptions);
    });
  });

  const commonPackages = getCommonPackages(commonPackageNames);
  const firstPackage = packages[0];
  if (development && firstPackage) {
    firstPackage.plugins.push(
      serve({
        verbose: true,
        contentBase: ["dist"],
        host: "localhost",
        port,
      })
    );
  }

  return [...packages, ...commonPackages];
}

function getCommonPackages(commonPackageNames) {
  return commonPackageNames.map(({ packageDir, commonPackageName }) => {
    const commonPackageDir = path.resolve(
      packageDir,
      "node_modules",
      commonPackageName
    );
    const packageJsonPath = path.join(commonPackageDir, "package.json");
    const input = path.join(commonPackageDir, require(packageJsonPath).main);
    return getRollupOptions({
      input,
      outputDir: path.join("dist", "common", commonPackageName),
      packageJsonPath,
      packageDir: commonPackageDir,
      isTs: false,
    });
  });
}

module.exports = getPackages();
