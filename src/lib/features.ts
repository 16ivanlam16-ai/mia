/**
 * Sections a visitor sees. Set a flag to true and rebuild to show it again.
 * claims: reference-number reward lookup. Keep off until real references exist.
 * guides: long articles. Keep off while they are still outlines.
 */
export const features = {
  claims: false,
  guides: false,
} as const;
