/** @type {import('prettier').Config} */
const prettierConfig = {
  plugins: ["prettier-plugin-embed", "prettier-plugin-sql"],
};

/** @type {import('prettier-plugin-embed').PrettierPluginEmbedOptions} */
const prettierPluginEmbedConfig = {
  embeddedSqlIdentifiers: ["sql"],
  embeddedMarkdownTags: ["markdown", "md"],
  noEmbeddedMultiLineIndentation: ["markdown", "md"],
  preserveEmbeddedExteriorWhitespaces: ["markdown", "md"],
};

/** @type {import('prettier-plugin-sql').SqlBaseOptions} */
const prettierPluginSqlConfig = {
  language: "sqlite",
  keywordCase: "upper",
  functionCase: "upper",
  dataTypeCase: "upper",
};

const config = {
  ...prettierConfig,
  ...prettierPluginEmbedConfig,
  ...prettierPluginSqlConfig,
};

export default config;
