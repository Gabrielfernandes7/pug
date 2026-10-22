declare module 'is-expression' {
  function isExpression(src: string, options?: { throw?: boolean }): boolean;
  export = isExpression;
}

declare module 'pug-error' {
  interface ErrorInfo {
    line?: number;
    column?: number;
    filename?: string;
    src?: string;
  }

  function error(code: string, message: string, info?: ErrorInfo): Error & { code: string; msg: string; column?: number };
  export = error;
}
