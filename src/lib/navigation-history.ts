/**
 * The paths the visitor walked through in this app.
 *
 * The list lives outside React so it survives the navigation that unmounts
 * the page, and a full page load resets it — which is exactly what tells us
 * the visitor did not arrive through the app.
 */
const visitedPaths: string[] = [];

/**
 * Record the page the visitor is on.
 *
 * Recording the same path twice does nothing, so the double effect of
 * React's strict mode does not count one page twice.
 */
export function recordVisitedPath(pathname: string) {
  if (visitedPaths[visitedPaths.length - 1] !== pathname) {
    visitedPaths.push(pathname);
  }
}

/**
 * True when the visitor reached the current page through the app, so there
 * is a previous page to go back to.
 */
export function hasAppHistory(): boolean {
  return visitedPaths.length > 1;
}
