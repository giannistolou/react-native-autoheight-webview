import type {InjectedScriptOptions} from '../types';
import {contentWrapperScript} from './contentWrapperScript';
import {
  linkedFilesScript,
  pageStyleScript,
  viewportMetaScript,
} from './headElementsScript';
import {sizeReporterScript} from './sizeReporterScript';
import {zoomDetectorScript} from './zoomDetectorScript';

export const buildInjectedScript = ({
  customScript = '',
  customStyle,
  files,
  viewportContent,
  scalesPageToFit,
  scrollEnabledWithZoomedin,
}: InjectedScriptOptions): string =>
  [
    customScript,
    pageStyleScript(customStyle),
    linkedFilesScript(files),
    contentWrapperScript,
    sizeReporterScript(Boolean(scalesPageToFit)),
    sizeTriggersScript,
    viewportMetaScript(viewportContent),
    scrollEnabledWithZoomedin ? zoomDetectorScript : '',
    'updateSize();',
  ].join('\n;\n');

const sizeTriggersScript = `
  window.addEventListener('load', updateSize);
  window.addEventListener('resize', updateSize);
  var contentMutationObserver = new (window.MutationObserver || window.WebKitMutationObserver)(updateSize);
  contentMutationObserver.observe(document, {subtree: true, attributes: true});
`;
