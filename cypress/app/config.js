global.__base = __dirname;

module.exports = {
  engine: {
    name: '@dylan/balm',
    opts: {
      bundle: true,
      watch: false,
      esbuild: {
        outdir: './cypress/public/dist',
        entryPoints: [
          './cypress/app/frontend.js',
          './cypress/app/head.js',
          './cypress/app/main.css',
          './cypress/app/head.css'
        ]
      }
    }
  }
};
