type Place = any;

type RouteState = {
  places: Place[];
  addPlace: (p: Place) => void;
  removePlace: (id: string | number) => void;
};

// Lightweight in-memory store used as a compatible stub for selectors like useRouteStore(s => s.addPlace)
const state: RouteState = {
  places: [],
  addPlace(p: Place) {
    state.places.push(p);
    console.log("routeStore: added place", p);
  },
  removePlace(id: string | number) {
    state.places = state.places.filter((pl: any) => pl.id !== id);
    console.log("routeStore: removed place", id);
  },
};

export function useRouteStore<T = RouteState>(selector?: (s: RouteState) => T): T | RouteState {
  if (typeof selector === "function") {
    return selector(state) as T;
  }
  return state;
}

export default useRouteStore;
