// Ambient declarations for non-code side-effect imports.
//
// Side-effect CSS imports like `import 'mapbox-gl/dist/mapbox-gl.css'` need a
// module declaration or TS reports TS2882 ("Cannot find module or type
// declarations for side-effect import"). Next.js handles the actual bundling;
// TS just needs to know the module exists. `*.module.css` keeps its own
// (more-specific) CSS-modules typing from Next.
declare module '*.css'
