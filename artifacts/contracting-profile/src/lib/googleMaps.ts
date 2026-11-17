export type Coordinates = { lat: number; lng: number };
type Camera = { center: Coordinates; range: number; tilt: number; heading: number };

export type Map3D = HTMLElement & Camera & {
  flyCameraTo(options: { endCamera: Camera; durationMillis: number }): void;
  stopCameraAnimation(): Promise<void>;
};
type Maps3DLibrary = {
  Map3DElement: new (options: Camera & { mode: 'SATELLITE'; gestureHandling: 'COOPERATIVE'; defaultUIHidden?: boolean }) => Map3D;
  Marker3DInteractiveElement: new (options: { position: Coordinates; label: string }) => HTMLElement;
};
type LatLng = { lat(): number; lng(): number };
type StreetData = { location?: { pano?: string; latLng?: LatLng } };
type StreetViewLibrary = {
  StreetViewService: new () => {
    getPanorama(request: { location: Coordinates; radius: number; preference: 'nearest'; sources: ['outdoor'] }, cb: (data: StreetData | null, status: string) => void): void;
  };
};
type GoogleMaps = {
  importLibrary(name: 'maps3d'): Promise<Maps3DLibrary>;
  importLibrary(name: 'streetView'): Promise<StreetViewLibrary>;
};
type MapsWindow = Window & { google?: { maps?: GoogleMaps }; diyarMapsReady?: () => void; gm_authFailure?: () => void };
const browser = window as MapsWindow;
const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
export const hasMapsKey = Boolean(key);
export const mapsAuthFailure = 'diyar-maps-auth-failure';
let loading: Promise<GoogleMaps> | undefined;
let rejected = false;

export function loadGoogleMaps(): Promise<GoogleMaps> {
  if (!key || rejected) return Promise.reject(new Error('Google Maps is unavailable.'));
  if (loading) return loading;
  loading = new Promise<GoogleMaps>((resolve, reject) => {
    const script = document.createElement('script');
    const finish = (error?: Error) => {
      clearTimeout(timer);
      delete browser.diyarMapsReady;
      script.onerror = null;
      if (!error && browser.google?.maps?.importLibrary) resolve(browser.google.maps);
      else {
        script.remove();
        reject(error ?? new Error('Google Maps did not initialize.'));
      }
    };
    const timer = window.setTimeout(() => finish(new Error('Google Maps load timed out.')), 16000);
    browser.diyarMapsReady = () => finish();
    browser.gm_authFailure = () => {
      rejected = true;
      window.dispatchEvent(new Event(mapsAuthFailure));
      finish(new Error('Google Maps authorization failed.'));
    };
    script.async = true;
    script.onerror = () => finish(new Error('Google Maps did not load.'));
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: 'beta', loading: 'async', callback: 'diyarMapsReady', language: 'ar', region: 'SA' })}`;
    document.head.append(script);
  });
  return loading;
}

const radius = 150;
function distance(a: Coordinates, b: LatLng) {
  const rad = Math.PI / 180;
  const h = Math.sin((b.lat() - a.lat) * rad / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat() * rad) * Math.sin((b.lng() - a.lng) * rad / 2) ** 2;
  return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Use the public Maps URL for the confirmed panorama, not a second in-page viewer.
export function findNearbyPanorama(service: InstanceType<StreetViewLibrary['StreetViewService']>, point: Coordinates): Promise<string | null> {
  return new Promise((resolve) => {
    service.getPanorama({ location: point, radius, preference: 'nearest', sources: ['outdoor'] }, (data, status) => {
      const position = data?.location?.latLng;
      const pano = data?.location?.pano;
      if (status !== 'OK' || !position || !pano || distance(point, position) > radius) return resolve(null);
      const params = new URLSearchParams({ api: '1', map_action: 'pano', pano, viewpoint: `${position.lat()},${position.lng()}` });
      resolve(`https://www.google.com/maps/@?${params}`);
    });
  });
}
