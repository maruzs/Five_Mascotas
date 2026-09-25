// src/data/pim/nutrition.ts
// Base de datos y tipado nutricional para el Comparador de Alimentos de FIVE Mascotas
// Preparado para importar automáticamente desde CSV cuando el cliente lo disponga.

export interface FoodNutritionProfile {
  productId: string;
  brand: string;
  name: string;
  pet: 'Perros' | 'Gatos';
  lifeStage: string;
  formatWeightKg: number;
  proteinPct: number;       // Proteína bruta %
  fatPct: number;           // Grasa bruta %
  fiberPct: number;         // Fibra bruta %
  moisturePct: number;      // Humedad %
  grainFree: boolean;       // Libre de granos
  firstFiveIngredients: string[]; // Primeros 5 ingredientes principales
  primaryProteinSource: string;   // 'Carne fresca deshidratada' | 'Harina de subproductos' | 'Proteína vegetal'
  hasProbiotics: boolean;
  omega3_6: boolean;
  qualityRating: 1 | 2 | 3 | 4 | 5; // 5 = Ultra Premium / Super Premium
  caloricDensityKcalKg: number;
  recommendationNote: string;
}

export const defaultFoodNutrition: Record<string, FoodNutritionProfile> = {
  'prod-0': {
    productId: 'prod-0',
    brand: 'Wellness Core',
    name: 'Alimento para perro adulto',
    pet: 'Perros',
    lifeStage: 'Adulto',
    formatWeightKg: 15,
    proteinPct: 34,
    fatPct: 16,
    fiberPct: 4,
    moisturePct: 10,
    grainFree: true,
    firstFiveIngredients: [
      'Pollo deshuesado fresco (26%)',
      'Pavo deshidratado (18%)',
      'Guisantes enteros',
      'Grasa de pollo preservada naturalmente',
      'Harina de papa'
    ],
    primaryProteinSource: 'Carne fresca y deshidratada de ave',
    hasProbiotics: true,
    omega3_6: true,
    qualityRating: 5,
    caloricDensityKcalKg: 3690,
    recommendationNote: 'Excelente opción para perros de alta energía. Primer ingrediente proteína real sin subproductos ni maíz.'
  },
  'prod-1': {
    productId: 'prod-1',
    brand: 'Nath',
    name: 'Alimento para gato adulto',
    pet: 'Gatos',
    lifeStage: 'Adulto',
    formatWeightKg: 7.5,
    proteinPct: 32,
    fatPct: 14,
    fiberPct: 3.5,
    moisturePct: 8,
    grainFree: false,
    firstFiveIngredients: [
      'Salmón deshidratado (22%)',
      'Arroz integral',
      'Proteína de maíz',
      'Grasa de ave purificada',
      'Pulpa de remolacha'
    ],
    primaryProteinSource: 'Salmón deshidratado',
    hasProbiotics: true,
    omega3_6: true,
    qualityRating: 4,
    caloricDensityKcalKg: 3820,
    recommendationNote: 'Fórmula equilibrada con aporte de ácidos grasos EPA/DHA para un pelaje sedoso y control de bolas de pelo.'
  },
  'prod-2': {
    productId: 'prod-2',
    brand: 'Dogxtreme',
    name: 'Alimento para cachorros',
    pet: 'Perros',
    lifeStage: 'Cachorro',
    formatWeightKg: 10,
    proteinPct: 30,
    fatPct: 18,
    fiberPct: 2.8,
    moisturePct: 9,
    grainFree: false,
    firstFiveIngredients: [
      'Pollo hidrolizado (24%)',
      'Arroz cervecero',
      'Trigo integral',
      'Aceite de pescado rico en DHA',
      'Huevo deshidratado'
    ],
    primaryProteinSource: 'Pollo y huevo',
    hasProbiotics: false,
    omega3_6: true,
    qualityRating: 4,
    caloricDensityKcalKg: 3950,
    recommendationNote: 'Nivel óptimo de calcio y fósforo para soporte esquelético durante la fase de crecimiento acelerado.'
  },
  'prod-3': {
    productId: 'prod-3',
    brand: 'Nath',
    name: 'Alimento para gato esterilizado',
    pet: 'Gatos',
    lifeStage: 'Adulto',
    formatWeightKg: 7.5,
    proteinPct: 36,
    fatPct: 11,
    fiberPct: 5.5,
    moisturePct: 9,
    grainFree: false,
    firstFiveIngredients: [
      'Pollo deshidratado (28%)',
      'Cebada malteada',
      'Fibra de celulosa purificada',
      'Arroz',
      'Hígado de ave hidrolizado'
    ],
    primaryProteinSource: 'Pollo deshidratado',
    hasProbiotics: true,
    omega3_6: true,
    qualityRating: 4,
    caloricDensityKcalKg: 3450,
    recommendationNote: 'Bajo en grasas y enriquecido con L-carnitina para prevenir el sobrepeso y pH controlado para salud urinaria.'
  },
  'prod-8': {
    productId: 'prod-8',
    brand: 'Nath',
    name: 'Alimento hipoalergénico perro',
    pet: 'Perros',
    lifeStage: 'Adulto',
    formatWeightKg: 12,
    proteinPct: 25,
    fatPct: 13,
    fiberPct: 3.2,
    moisturePct: 9,
    grainFree: true,
    firstFiveIngredients: [
      'Cordero fresco deshuesado (20%)',
      'Carne de cordero deshidratada (18%)',
      'Guisantes verdes',
      'Camote deshidratado',
      'Aceite de linaza'
    ],
    primaryProteinSource: 'Monoproteico de cordero',
    hasProbiotics: true,
    omega3_6: true,
    qualityRating: 5,
    caloricDensityKcalKg: 3600,
    recommendationNote: 'Ideal para perros con piel sensible, dermatitis o alergias al pollo/res. Cero granos alergénicos.'
  },
  'prod-9': {
    productId: 'prod-9',
    brand: 'Wellness Core',
    name: 'Alimento húmedo para gato paté',
    pet: 'Gatos',
    lifeStage: 'Adulto',
    formatWeightKg: 0.15,
    proteinPct: 11,
    fatPct: 7,
    fiberPct: 1,
    moisturePct: 78,
    grainFree: true,
    firstFiveIngredients: [
      'Pavo fresco (35%)',
      'Caldo de cocción natural',
      'Hígado de pollo (15%)',
      'Arándanos rojos',
      'Aceite de salmón'
    ],
    primaryProteinSource: 'Pavo e hígado fresco',
    hasProbiotics: false,
    omega3_6: true,
    qualityRating: 5,
    caloricDensityKcalKg: 1050,
    recommendationNote: 'Alta hidratación esencial para prevenir problemas renales en felinos. Textura suave paté gourmet.'
  },
};

/**
 * Obtiene el perfil nutricional de un producto o genera uno base
 */
export function getProductNutrition(productId: string): FoodNutritionProfile | null {
  return defaultFoodNutrition[productId] || null;
}
