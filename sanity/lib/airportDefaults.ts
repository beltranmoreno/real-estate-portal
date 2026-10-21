/**
 * The airports that serve Casa de Campo, with default distance and drive
 * time from the resort. Every new property starts with these three; editors
 * adjust the numbers per house. Fixed document ids so properties can
 * reference them from day one.
 */
export const DEFAULT_AIRPORTS = [
  { id: 'airport-lrm', name: 'La Romana', code: 'LRM', distanceKm: 2, driveTime: 5, aliases: ['la romana', 'lrm'] },
  { id: 'airport-puj', name: 'Punta Cana', code: 'PUJ', distanceKm: 75, driveTime: 60, aliases: ['punta cana', 'puj'] },
  {
    id: 'airport-sdq',
    name: 'Santo Domingo',
    code: 'SDQ',
    distanceKm: 110,
    driveTime: 70,
    aliases: ['santo domingo', 'las americas', 'las américas', 'sdq'],
  },
] as const
