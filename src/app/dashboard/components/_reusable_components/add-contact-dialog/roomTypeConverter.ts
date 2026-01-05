/**
 * Room Type Conversion Utilities
 * 
 * Backend requires preferredRoomType: "SINGLE" | "DOUBLE" for consistency
 * Frontend UI displays "One-in-one" | "Two-in-one" for user-friendliness
 */

export const ROOM_TYPE_DISPLAY_TO_API = {
  "One-in-one": "SINGLE",
  "Two-in-one": "DOUBLE",
  "Three-in-one": "TRIPLE",
  "Triple": "TRIPLE",
  "TP": "TRIPLE",
} as const;

export const ROOM_TYPE_API_TO_DISPLAY = {
  "SINGLE": "One-in-one",
  "DOUBLE": "Two-in-one",
  "TRIPLE": "Three-in-one",
} as const;

export type RoomTypeDisplay = keyof typeof ROOM_TYPE_DISPLAY_TO_API;
export type RoomTypeAPI = typeof ROOM_TYPE_DISPLAY_TO_API[RoomTypeDisplay];

/**
 * Converts UI room type display name to API format
 * @param displayName - "One-in-one" or "Two-in-one"
 * @returns "SINGLE" or "DOUBLE"
 */
export function convertRoomTypeToAPI(displayName: RoomTypeDisplay): RoomTypeAPI {
  return ROOM_TYPE_DISPLAY_TO_API[displayName];
}

/**
 * Converts API room type to UI display name
 * @param apiValue - "SINGLE" or "DOUBLE"
 * @returns "One-in-one" or "Two-in-one"
 */
export function convertRoomTypeToDisplay(apiValue: RoomTypeAPI): RoomTypeDisplay {
  return ROOM_TYPE_API_TO_DISPLAY[apiValue];
}

/**
 * Validates if a display name is a valid room type
 */
export function isValidRoomTypeDisplay(displayName: string): displayName is RoomTypeDisplay {
  return ["One-in-one", "Two-in-one", "Three-in-one", "Triple", "TP"].includes(displayName);
}

/**
 * Validates if an API value is a valid room type
 */
export function isValidRoomTypeAPI(apiValue: string): apiValue is RoomTypeAPI {
  return ["SINGLE", "DOUBLE", "TRIPLE"].includes(apiValue);
}

