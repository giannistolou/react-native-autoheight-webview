import type {SizeUpdate} from './types';

export const AUTO_HEIGHT_MESSAGE_TOPIC = 'rnaw';

export const AutoHeightMessageType = {
  contentSize: 'contentSize',
  zoomState: 'zoomState',
} as const;

export interface ContentSizeMessage extends SizeUpdate {
  topic: typeof AUTO_HEIGHT_MESSAGE_TOPIC;
  type: typeof AutoHeightMessageType.contentSize;
}

export interface ZoomStateMessage {
  topic: typeof AUTO_HEIGHT_MESSAGE_TOPIC;
  type: typeof AutoHeightMessageType.zoomState;
  isZoomedIn: boolean;
}

export type AutoHeightMessage = ContentSizeMessage | ZoomStateMessage;

export const parseAutoHeightMessage = (
  rawMessage: string,
): AutoHeightMessage | undefined => {
  const payload = parseJsonOrUndefined(rawMessage);
  return isAutoHeightMessage(payload) ? payload : undefined;
};

const parseJsonOrUndefined = (rawMessage: string): unknown => {
  try {
    return JSON.parse(rawMessage);
  } catch {
    return undefined;
  }
};

const KNOWN_MESSAGE_TYPES: ReadonlySet<unknown> = new Set(
  Object.values(AutoHeightMessageType),
);

const isAutoHeightMessage = (payload: unknown): payload is AutoHeightMessage =>
  typeof payload === 'object' &&
  payload !== null &&
  'topic' in payload &&
  payload.topic === AUTO_HEIGHT_MESSAGE_TOPIC &&
  'type' in payload &&
  KNOWN_MESSAGE_TYPES.has(payload.type);
