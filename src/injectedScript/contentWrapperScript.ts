import {toScriptLiteral} from './toScriptLiteral';

const CONTENT_WRAPPER_ID = 'rnahw-wrapper';

export const contentWrapperScript = `
  var contentWrapper = document.getElementById(${toScriptLiteral(CONTENT_WRAPPER_ID)});
  if (!contentWrapper) {
    contentWrapper = document.createElement('div');
    contentWrapper.id = ${toScriptLiteral(CONTENT_WRAPPER_ID)};
    while (document.body.firstChild instanceof Node) {
      contentWrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(contentWrapper);
  }
`;
