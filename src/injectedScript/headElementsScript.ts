import type {StylesFile} from '../types';
import {toScriptLiteral} from './toScriptLiteral';

const RESET_BODY_SPACING_STYLE = `
  body {
    margin: 0;
    padding: 0;
  }
`;

export const viewportMetaScript = (viewportContent?: string) =>
  viewportContent
    ? `
  var viewportMeta = document.createElement('meta');
  viewportMeta.setAttribute('name', 'viewport');
  viewportMeta.setAttribute('content', ${toScriptLiteral(viewportContent)});
  document.getElementsByTagName('head')[0].appendChild(viewportMeta);
`
    : '';

export const linkedFilesScript = (files: StylesFile[] = []) =>
  files.map(linkedFileScript).join('');

const linkedFileScript = ({rel, type, href}: StylesFile) => `
  var link = document.createElement('link');
  link.rel = ${toScriptLiteral(rel)};
  link.type = ${toScriptLiteral(type)};
  link.href = ${toScriptLiteral(href)};
  document.head.appendChild(link);
`;

export const pageStyleScript = (customStyle = '') => `
  var styleElement = document.createElement('style');
  styleElement.innerHTML = ${toScriptLiteral(RESET_BODY_SPACING_STYLE + customStyle)};
  document.head.appendChild(styleElement);
`;
