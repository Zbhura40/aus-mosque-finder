/// <reference types="vite/client" />

// Google Maps API types
interface Window {
  google: typeof google;
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: any);
    }
    class Marker {
      constructor(options: any);
    }
    class Size {
      constructor(width: number, height: number);
    }
    class Point {
      constructor(x: number, y: number);
    }
  }
}
