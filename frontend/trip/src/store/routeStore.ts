import { create } from "zustand";

export interface Place {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
}

interface RouteStore {
  places: Place[];
  tripId: string | null;
  addPlace: (place: Place) => void;
  removePlace: (placeId: string) => void;
  clearRoute: () => void;
  reorderPlaces: (newPlaces: Place[]) => void;
  setTripId: (id: string) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  places: [],
  tripId: null,

  addPlace: (place: Place) =>
    set((state) => ({
      places: [...state.places, place],
    })),

  removePlace: (placeId: string) =>
    set((state) => ({
      places: state.places.filter((place) => place.id !== placeId),
    })),

  clearRoute: () => set({ places: [], tripId: null }),

  reorderPlaces: (newPlaces: Place[]) =>
    set({
      places: newPlaces,
    }),

  setTripId: (id: string) =>
    set({ tripId: id }),
}));

