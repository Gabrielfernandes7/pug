declare module 'is-expression' {
  function isExpression(src: string, options?: { throw?: boolean }): boolean;
  export = isExpression;
}
