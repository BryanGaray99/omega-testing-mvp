import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normaliza el tiempo a segundos
 * @param time - Tiempo en microsegundos, milisegundos o segundos
 * @param unit - Unidad del tiempo ('microseconds', 'milliseconds', 'seconds')
 * @returns Tiempo en segundos con formato
 */
export function normalizeTimeToSeconds(time: number, unit: 'microseconds' | 'milliseconds' | 'seconds' = 'milliseconds'): string {
  let seconds: number;
  
  switch (unit) {
    case 'microseconds':
      seconds = time / 1000000; // Convertir microsegundos a segundos
      break;
    case 'milliseconds':
      seconds = time / 1000; // Convertir milisegundos a segundos
      break;
    case 'seconds':
      seconds = time; // Ya está en segundos
      break;
    default:
      // Auto-detect: si el número es muy grande (> 1000000), asumir microsegundos
      // si es mediano (1000-1000000), asumir milisegundos
      // si es pequeño (< 1000), asumir segundos
      if (time > 1000000) {
        seconds = time / 1000000; // microsegundos
      } else if (time > 1000) {
        seconds = time / 1000; // milisegundos
      } else {
        seconds = time; // segundos
      }
  }
  
  // Formatear con 2 decimales si es menor a 1 segundo, sino con 1 decimal
  if (seconds < 1) {
    return `${seconds.toFixed(2)}s`;
  } else {
    return `${seconds.toFixed(1)}s`;
  }
}