export const REC_CROPS = [
  { n: 'Frijol', f: 'Leguminosa', c: 92, lvl: 'Alta', agua: 'Baja', ciclo: 90, siembra: 'Jun – Jul', desc: 'Fija nitrógeno y recupera el suelo tras el maíz. Rinde bien con la lluvia prevista en tu zona.', suelo: 'Franco o franco-arcilloso', temp: '18 – 27 °C',
    why: [['ok', 'Fija nitrógeno en el suelo y compensa lo que consumió el maíz.'], ['ok', 'Necesita poca agua y la lluvia prevista en tu zona es suficiente.'], ['ok', 'Su ciclo de 90 días te deja cosechar pronto y rotar de nuevo.']] },
  { n: 'Calabaza', f: 'Cucurbitácea', c: 84, lvl: 'Alta', agua: 'Media', ciclo: 100, siembra: 'Jun – Ago', desc: 'Cubre el suelo, frena la maleza y conserva la humedad. Buena rotación después del maíz.', suelo: 'Franco, bien drenado', temp: '18 – 30 °C',
    why: [['ok', 'Cubre el suelo, frena la maleza y reduce la evaporación.'], ['ok', 'Aprovecha la humedad media del terreno sin exigir mucho riego.'], ['ok', 'Rota bien después del maíz y diversifica tu cosecha.']] },
  { n: 'Soya', f: 'Leguminosa', c: 78, lvl: 'Media', agua: 'Media', ciclo: 110, siembra: 'Jun – Jul', desc: 'También fija nitrógeno, pero necesita buena humedad durante la floración para rendir.', suelo: 'Franco o franco-arcilloso', temp: '20 – 30 °C',
    why: [['ok', 'Fija nitrógeno y mejora el suelo después del maíz.'], ['ok', 'Rinde bien solo si la humedad se mantiene durante la floración.'], ['warn', 'Tiene buena demanda, aunque su ciclo es de 110 días.']] },
  { n: 'Maíz', f: 'Gramínea', c: 61, lvl: 'Media', agua: 'Media', ciclo: 120, siembra: 'May – Jun', desc: 'Repetirlo agota el nitrógeno y favorece plagas. Solo conviene si agregas abono orgánico.', suelo: 'Franco, rico en materia orgánica', temp: '18 – 30 °C',
    why: [['ok', 'Ya conoces su manejo y su ciclo de cultivo.'], ['ok', 'Con abono orgánico puedes reponer el nitrógeno que consume.'], ['warn', 'Repetirlo sin rotar favorece plagas y baja el rendimiento.']] },
  { n: 'Tomate', f: 'Solanácea', c: 58, lvl: 'Media', agua: 'Alta', ciclo: 95, siembra: 'Sep – Oct', desc: 'Demanda mucho riego. Considéralo solo si tienes acceso a agua constante en el terreno.', suelo: 'Franco, rico en materia orgánica', temp: '18 – 28 °C',
    why: [['ok', 'Ciclo corto de 95 días y buena demanda en el mercado.'], ['ok', 'Necesita riego constante: revisa que tengas agua todo el ciclo.'], ['warn', 'Se siembra de septiembre a octubre, cuando baja la lluvia fuerte.']] },
  { n: 'Café', f: 'Perenne', c: 45, lvl: 'Baja', agua: 'Alta', ciclo: 'Perenne', siembra: 'Jun – Jul', desc: 'Requiere altitud y sombra; las condiciones actuales del terreno no son las ideales.', suelo: 'Franco, profundo y con buen drenaje', temp: '17 – 23 °C',
    why: [['ok', 'Es un cultivo perenne: se queda varios años en el terreno.'], ['ok', 'Requiere altitud y sombra que tu terreno no ofrece por ahora.'], ['warn', 'Demanda mucha agua durante todo el año.']] },
];

export const LVL = {
  Alta: { badge: 'bg-mint/15 text-teal-700', bar: '#2BB3A3' },
  Media: { badge: 'bg-amber-100 text-amber-700', bar: '#4FA3E0' },
  Baja: { badge: 'bg-rose-100 text-rose-700', bar: '#E8A33A' },
};
