const HTML_TAG_OPENER = /</g;
const ESCAPED_HTML_TAG_OPENER = '\\u003c';

export const toScriptLiteral = (value: string | boolean): string =>
  JSON.stringify(value).replace(HTML_TAG_OPENER, ESCAPED_HTML_TAG_OPENER);
