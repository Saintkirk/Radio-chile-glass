/**
 * Minimal ambient declaration for the `flushSync` API used from react-dom.
 * The project ships react-dom for react-native-web but has no @types/react-dom;
 * this keeps the synchronous-commit carousel path typed without adding
 * devDependencies.
 */
declare module "react-dom" {
  export function flushSync<R>(fn: () => R): R;
  export function flushSync<A>(fn: (args: A) => void, args: A): void;
}
