module.exports = {
  // Source token files
  source: ["design/tokens/**/*.json"],
  // Platforms define output formats
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "client/src/styles/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          // Style-Dictionary will prepend an auto-generated header.
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
}; 