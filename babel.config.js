module.exports = {
 presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: [
            ">0.25%",
            "ie >= 11"
          ]
        },
        corejs: 3,
        useBuiltIns: "entry",
        modules: process.env.BABEL_ENV === 'cjs' ? 'auto' : false
      }
    ],
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    "@babel/plugin-transform-runtime"
  ]
};
