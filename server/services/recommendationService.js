const CROP_CATALOG = [
  {
    id: 'maiz',
    nombre: 'Maíz (Zea mays)',
    nombreCientifico: 'Zea mays L.',
    categoria: 'Granos básicos',
    tempOptimaMin: 18,
    tempOptimaMax: 30,
    precipitacionMinMes: 50,
    suelosOptimos: ['Franco', 'Franco arcilloso', 'Franco limoso'],
    toleranciaSequia: 'Media',
    requerimientoAgua: '500 - 800 mm por ciclo',
    cicloDias: 130,
    rendimientoTonHa: 7.5,
    mesesSiembra: ['MAY', 'JUN', 'JUL', 'NOV', 'DEC'],
    consejos: [
      'Para agricultores principiantes: Realizar análisis de suelo previo a la siembra para calibrar nitrógeno y fósforo.',
      'Profundidad de siembra ideal: 4 a 6 cm.',
      'Momento crítico de agua: Floración y llenado de grano (espigamiento).'
    ],
    alertasComunes: 'Vigilar presencia de gusano cogollero en temperaturas cálidas (>25°C).'
  },
  {
    id: 'frijol',
    nombre: 'Frijol (Phaseolus vulgaris)',
    nombreCientifico: 'Phaseolus vulgaris L.',
    categoria: 'Leguminosas',
    tempOptimaMin: 16,
    tempOptimaMax: 26,
    precipitacionMinMes: 40,
    suelosOptimos: ['Franco', 'Franco arenoso', 'Franco limoso'],
    toleranciaSequia: 'Media-Alta',
    requerimientoAgua: '350 - 500 mm por ciclo',
    cicloDias: 85,
    rendimientoTonHa: 2.2,
    mesesSiembra: ['JUN', 'JUL', 'AUG', 'FEB'],
    consejos: [
      'Excelente cultivo para fijar nitrógeno atmosférico y regenerar parcelas desgastadas.',
      'Evitar encharcamientos; el exceso de agua favorece la marchitez por Fusarium.',
      'Compatible con rotación o asociación con maíz (sistema milpa tradicional).'
    ],
    alertasComunes: 'Sensible a heladas tardías y alta humedad prolongada.'
  },
  {
    id: 'tomate',
    nombre: 'Tomate Saladette (Solanum lycopersicum)',
    nombreCientifico: 'Solanum lycopersicum L.',
    categoria: 'Hortalizas de alto valor',
    tempOptimaMin: 19,
    tempOptimaMax: 28,
    precipitacionMinMes: 30,
    suelosOptimos: ['Franco arenoso', 'Franco', 'Franco limoso'],
    toleranciaSequia: 'Baja (Requiere riego constante)',
    requerimientoAgua: '600 - 900 mm con riego por goteo',
    cicloDias: 110,
    rendimientoTonHa: 45.0,
    mesesSiembra: ['OCT', 'NOV', 'DEC', 'JAN', 'FEB'],
    consejos: [
      'Recomendado para agricultores con acceso a sistema de riego por goteo tecnificado.',
      'El entutorado y podas tempranas aumentan el calibre y sanidad del fruto.',
      'Monitorear conductividad eléctrica y pH del suelo (ideal entre 6.0 y 6.8).'
    ],
    alertasComunes: 'Alta susceptibilidad a mosquita blanca y tizón tardío en humedad relativa > 75%.'
  },
  {
    id: 'trigo',
    nombre: 'Trigo Harinero (Triticum aestivum)',
    nombreCientifico: 'Triticum aestivum L.',
    categoria: 'Cereales de invierno',
    tempOptimaMin: 12,
    tempOptimaMax: 22,
    precipitacionMinMes: 35,
    suelosOptimos: ['Franco arcilloso', 'Franco', 'Arcilloso'],
    toleranciaSequia: 'Media',
    requerimientoAgua: '400 - 600 mm por ciclo',
    cicloDias: 125,
    rendimientoTonHa: 5.8,
    mesesSiembra: ['NOV', 'DEC', 'JAN'],
    consejos: [
      'Ideal para ciclo otoño-invierno cuando descienden las temperaturas.',
      'Aprovecha muy bien la humedad residual o riegos de auxilio invernales.',
      'Fertilización nitrogenada fraccionada en amacollamiento y encañe.'
    ],
    alertasComunes: 'Vigilar roya de la hoja en primaveras con rocío abundante.'
  },
  {
    id: 'chile',
    nombre: 'Chile Jalapeño / Serrano (Capsicum annuum)',
    nombreCientifico: 'Capsicum annuum L.',
    categoria: 'Hortalizas',
    tempOptimaMin: 20,
    tempOptimaMax: 30,
    precipitacionMinMes: 40,
    suelosOptimos: ['Franco arenoso', 'Franco', 'Franco arcilloso'],
    toleranciaSequia: 'Baja-Media',
    requerimientoAgua: '550 - 750 mm por ciclo',
    cicloDias: 105,
    rendimientoTonHa: 28.0,
    mesesSiembra: ['MAR', 'APR', 'MAY', 'AUG'],
    consejos: [
      'Requiere buena temperatura en suelo para germinación rápida (20°C a 25°C).',
      'El acolchado plástico retiene humedad y reduce necesidad de deshierbe manual.',
      'Aporte de calcio y boro fundamental para evitar pudrición apical.'
    ],
    alertasComunes: 'Sensible a picudo del chile y pudrición de raíz (Phytophthora).'
  },
  {
    id: 'sorgo',
    nombre: 'Sorgo Granífero (Sorghum bicolor)',
    nombreCientifico: 'Sorghum bicolor (L.) Moench',
    categoria: 'Forrajes y granos',
    tempOptimaMin: 21,
    tempOptimaMax: 35,
    precipitacionMinMes: 30,
    suelosOptimos: ['Franco', 'Arcilloso', 'Franco arcilloso', 'Arenoso'],
    toleranciaSequia: 'Alta (Muy resistente)',
    requerimientoAgua: '350 - 550 mm por ciclo',
    cicloDias: 115,
    rendimientoTonHa: 6.2,
    mesesSiembra: ['APR', 'MAY', 'JUN', 'JUL'],
    consejos: [
      'La mejor opción si la zona presenta riesgo de sequía o escasa disponibilidad de agua.',
      'Soporta suelos salinos o pesados donde el maíz no prospera con éxito.',
      'Excelente como forraje y grano para ganado.'
    ],
    alertasComunes: 'Revisar presencia de pulgón amarillo en el envés de hojas basales.'
  },
  {
    id: 'aguacate',
    nombre: 'Aguacate Hass (Persea americana)',
    nombreCientifico: 'Persea americana Mill.',
    categoria: 'Frutales perennes',
    tempOptimaMin: 14,
    tempOptimaMax: 28,
    precipitacionMinMes: 60,
    suelosOptimos: ['Franco arenoso', 'Franco limoso', 'Franco'],
    toleranciaSequia: 'Media',
    requerimientoAgua: '1000 - 1400 mm anuales',
    cicloDias: 365,
    rendimientoTonHa: 11.5,
    mesesSiembra: ['JUN', 'JUL', 'AUG'],
    consejos: [
      'Requiere excelente drenaje interno; no tolera asfixia radicular ni suelos arcillosos compactos.',
      'Altitud ideal entre 1,200 y 2,200 msnm.',
      'Inversión a mediano plazo (primeras cosechas a partir del 3er año).'
    ],
    alertasComunes: 'Sensible a heladas por debajo de -2°C y a exceso de encharcamiento.'
  }
];

/**
 * Calcula las recomendaciones agronómicas basadas en los datos del terreno y de la NASA
 */
function evaluateCropRecommendations(terreno, agroData) {
  const currentTemp = agroData?.clima?.temperatura_actual_promedio_c || 22;
  const annualTemp = agroData?.clima?.temperatura_anual_promedio_c || 21;
  const rainMonth = agroData?.clima?.precipitacion_mes_actual_mm || 40;
  const soilMoisture = agroData?.smap?.humedad_superficie_porcentaje || 45;
  const currentMonth = agroData?.metadata?.mes_evaluado || 'JUN';
  const elevacion = agroData?.metadata?.elevacion_msnm || 1500;
  const tipoSuelo = terreno.tipo_suelo || 'Franco';
  const fuenteAgua = terreno.fuente_agua || 'Temporal';

  const hasIrigation = fuenteAgua.toLowerCase().includes('riego') || fuenteAgua.toLowerCase().includes('pozo');

  const evaluations = CROP_CATALOG.map(crop => {
    let score = 100;
    const reasons = [];
    const alerts = [];

    // 1. Evaluación de temperatura
    if (currentTemp >= crop.tempOptimaMin && currentTemp <= crop.tempOptimaMax) {
      reasons.push(`Temperatura actual (${currentTemp}°C) en rango ideal (${crop.tempOptimaMin}-${crop.tempOptimaMax}°C).`);
    } else {
      const diff = Math.min(Math.abs(currentTemp - crop.tempOptimaMin), Math.abs(currentTemp - crop.tempOptimaMax));
      const penalty = Math.min(30, Math.round(diff * 5));
      score -= penalty;
      if (currentTemp < crop.tempOptimaMin) {
        alerts.push(`Temperatura algo baja (${currentTemp}°C) para velocidad óptima de crecimiento.`);
      } else {
        alerts.push(`Temperatura elevada (${currentTemp}°C); riesgo de golpe de calor en floración.`);
      }
    }

    // 2. Evaluación de tipo de suelo
    if (crop.suelosOptimos.includes(tipoSuelo)) {
      reasons.push(`Textura del suelo (${tipoSuelo}) excelente para desarrollo de raíces.`);
    } else {
      score -= 15;
      alerts.push(`El suelo ${tipoSuelo} no es el predilecto; se sugiere incorporar materia orgánica o drenaje.`);
    }

    // 3. Evaluación hídrica (Lluvia NASA + Riego)
    if (hasIrigation) {
      reasons.push(`Cuenta con ${fuenteAgua}, garantizando el suministro hídrico necesario.`);
      score += 5;
    } else {
      // Depende de lluvia NASA y humedad SMAP
      if (rainMonth < crop.precipitacionMinMes && soilMoisture < 35) {
        score -= 25;
        alerts.push(`Precipitación actual (${rainMonth} mm/mes) y humedad SMAP (${soilMoisture}%) deficientes sin sistema de riego.`);
      } else {
        reasons.push(`Lluvia mensual (${rainMonth} mm) y humedad del suelo (${soilMoisture}%) adecuadas para temporal.`);
      }
    }

    // 4. Temporada de siembra
    if (crop.mesesSiembra.includes(currentMonth)) {
      reasons.push(`El mes actual (${currentMonth}) coincide con la ventana recomendada de siembra.`);
      score += 5;
    } else {
      alerts.push(`Fuera de la ventana óptima de siembra directa (Meses sugeridos: ${crop.mesesSiembra.join(', ')}).`);
    }

    // Normalizar puntaje 0-100%
    score = Math.max(20, Math.min(99, score));

    let aptitud = 'Excelente';
    if (score < 50) aptitud = 'No recomendado';
    else if (score < 70) aptitud = 'Moderada / Con cuidados';
    else if (score < 85) aptitud = 'Muy favorable';

    return {
      cultivo: crop.nombre,
      nombre_cientifico: crop.nombreCientifico,
      categoria: crop.categoria,
      compatibilidad_porcentaje: score,
      nivel_aptitud: aptitud,
      temporada_optima: crop.mesesSiembra.join(', '),
      requerimiento_agua: crop.requerimientoAgua,
      tolerancia_sequia: crop.toleranciaSequia,
      tiempo_cosecha_dias: crop.cicloDias,
      rendimiento_estimado_ton_ha: crop.rendimientoTonHa,
      motivos_compatibilidad: reasons,
      alertas_agronomicas: alerts.concat(crop.alertasComunes ? [crop.alertasComunes] : []),
      consejos_practicos: crop.consejos
    };
  });

  // Ordenar de mayor a menor compatibilidad
  evaluations.sort((a, b) => b.compatibilidad_porcentaje - a.compatibilidad_porcentaje);

  return {
    terreno_id: terreno.id,
    terreno_nombre: terreno.nombre,
    fecha_analisis: new Date().toISOString(),
    resumen_agroclimatico: {
      temperatura: `${currentTemp} °C`,
      precipitacion_mes: `${rainMonth} mm`,
      humedad_suelo_smap: `${soilMoisture} %`,
      tipo_suelo: tipoSuelo,
      disponibilidad_agua: fuenteAgua
    },
    recomendaciones: evaluations
  };
}

module.exports = {
  CROP_CATALOG,
  evaluateCropRecommendations
};
