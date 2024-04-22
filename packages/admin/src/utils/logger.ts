/* eslint-disable no-console */
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import pino from 'pino';
import { HEADERS, IS_PRODUCTION } from './constants';

const log = pino({
  browser: {
    write(obj) {
      try {
        console.log(JSON.stringify(obj));
      } catch (err) {
        if (err instanceof Error) {
          console.log(JSON.stringify(err, ['name', 'message', 'stack']));
        }
        console.log(JSON.stringify({ message: 'Unknown error type' }));
      }
    },
  },
});

const CONSOLE_COLOURS = {
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
} as const;

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
} as const;

const LOG_COLOURS = {
  [LOG_LEVELS.ERROR]: CONSOLE_COLOURS.RED,
  [LOG_LEVELS.WARN]: CONSOLE_COLOURS.YELLOW,
  [LOG_LEVELS.INFO]: CONSOLE_COLOURS.GREEN,
  [LOG_LEVELS.HTTP]: CONSOLE_COLOURS.MAGENTA,
  [LOG_LEVELS.DEBUG]: CONSOLE_COLOURS.WHITE,
} as const;

type ValueOf<T> = T[keyof T];

type LogLevel = ValueOf<typeof LOG_LEVELS>;

const withLogColour = (text: string, level: LogLevel) =>
  LOG_COLOURS[level] + text + CONSOLE_COLOURS.WHITE;

const formatTime = (date: Date) =>
  `${date.toLocaleTimeString()}.${date.getMilliseconds()}`;

// pino doesn't have a log.http
const getProdLogLevel = (level: LogLevel) =>
  level === LOG_LEVELS.HTTP ? LOG_LEVELS.INFO : level;

const getLoggerWithLevel =
  (level: LogLevel) => (logMessage: string, info?: object | Error) => {
    const date = new Date();
    const time = formatTime(date);
    if (!IS_PRODUCTION) {
      console.log(
        `[${time}] ` +
          withLogColour(`${level.toUpperCase()}: ${logMessage}`, level)
      );
      if (info) {
        if (info instanceof Error)
          // object spread ignores properties inherited from prototype
          info = { ...info, message: info.message, stack: info.stack };
        console.dir(info, { depth: null });
      }
    } else log[getProdLogLevel(level)](info, logMessage);
  };

const addErrorInfo = (
  error,
  req: NextRequest | NextApiRequest | GetServerSidePropsContext['req']
) => {
  if (req instanceof NextRequest)
    error.correlationId = req.headers.get(HEADERS.CORRELATION_ID);
  else error.correlationId = req.headers[HEADERS.CORRELATION_ID];
  return error;
};

const asObject = (
  entries: IterableIterator<[string, string]>,
  keysToExclude: string[] = []
) =>
  Object.fromEntries(
    Array.from(entries).filter(([key]) => !keysToExclude.includes(key))
  );

const formatRequest = (req: NextRequest) => ({
  url: req.url,
  method: req.method,
  cookies: req.cookies
    .getAll()
    .filter(({ name }) => name !== 'user-service-token'),
  headers: asObject(req.headers.entries(), ['cookie']),
});

const formatResponse = (res: NextResponse) => ({
  url: res.url,
  status: res.status,
  headers: asObject(res.headers.entries(), ['cookie']),
});

type Logger = Record<LogLevel, ReturnType<typeof getLoggerWithLevel>>;

export const logger = {
  ...Object.values(LOG_LEVELS).reduce(
    (acc, value) => ({ ...acc, [value]: getLoggerWithLevel(value) }),
    {} as Logger
  ),
  utils: {
    addErrorInfo,
    formatRequest,
    formatResponse,
  },
};
