export function navigateTo(route: string, onRouteChange?: (route: string) => void) {
  if (onRouteChange) {
    onRouteChange(route);
  } else if (typeof window !== 'undefined') {
    window.history.pushState({}, '', route);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
