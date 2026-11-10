import type { MovementType } from '@/lib/admin/moneyLedger'

const LABELS: Record<MovementType, { en: string; es: string }> = {
  stay: { en: 'Stay booked', es: 'Estadía reservada' },
  payment: { en: 'Payment received', es: 'Pago recibido' },
  expected: { en: 'Payment expected', es: 'Pago esperado' },
  settled: { en: 'Settled outside', es: 'Saldado por fuera' },
  extra: { en: 'Extra', es: 'Extra' },
  service: { en: 'Service', es: 'Servicio' },
  commission: { en: 'Commission paid', es: 'Comisión cobrada' },
  deposit: { en: 'Deposit returned', es: 'Depósito devuelto' },
}

export const movementLabel = (type: MovementType, locale: 'en' | 'es') => LABELS[type][locale]
