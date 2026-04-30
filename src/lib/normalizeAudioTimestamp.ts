/**
 * Normalizes audio timestamps for display.
 * Examples:
 * - "00:01:22" -> "00:01:22"
 * - "01:23:00" -> "01:23"
 * - "64:36:00" -> "64:36"
 * 
 * @param value The raw timestamp string
 * @returns Formatted timestamp for display
 */
export function normalizeAudioTimestamp(value: string): string {
  if (!value) return "00:00";
  
  const parts = value.split(':');
  
  if (parts.length === 3) {
    const hh = parts[0];
    const mm = parts[1];
    const ss = parts[2];
    
    // If it's like 01:23:00 (HH:MM:SS where SS is 00), often it's meant to be MM:SS if HH is 00
    // But the requirements say:
    // "01:23:00" displays as "01:23"
    // "64:36:00" displays as "64:36"
    // This implies that if there are 3 parts and the last one is "00", we drop it?
    // Or maybe it's meant to be HH:MM if it's long?
    
    // Let's follow the examples literally:
    if (ss === "00") {
      return `${hh}:${mm}`;
    }
    
    return value;
  }
  
  return value;
}
