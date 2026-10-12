// Banque d'aliments du plan repas (valeurs moyennes pour 100 g, cuit sauf mention).
// tags : ce qui permet d'exclure un aliment selon le régime ou les allergies déclarées.
export const PROTEINS = [
  { id: "poulet", name: "Blanc de poulet", kcal: 165, p: 31, c: 0, f: 3.6, tags: ["viande"], prep: true },
  { id: "dinde", name: "Escalope de dinde", kcal: 135, p: 29, c: 0, f: 1.5, tags: ["viande"], prep: true },
  { id: "boeuf", name: "Bœuf haché 5 %", kcal: 175, p: 27, c: 0, f: 7, tags: ["viande"], prep: true },
  { id: "saumon", name: "Saumon", kcal: 205, p: 22, c: 0, f: 13, tags: ["poisson"], prep: true },
  { id: "cabillaud", name: "Cabillaud", kcal: 105, p: 23, c: 0, f: 1, tags: ["poisson"], prep: true },
  { id: "thon", name: "Thon au naturel", kcal: 115, p: 26, c: 0, f: 1, tags: ["poisson"] },
  { id: "oeufs", name: "Œufs", kcal: 145, p: 12.5, c: 0.7, f: 10, tags: ["oeuf"], unit: { g: 55, label: "œuf" } },
  { id: "tofu", name: "Tofu ferme", kcal: 145, p: 15, c: 2, f: 9, tags: ["soja"], prep: true },
  { id: "lentilles", name: "Lentilles", kcal: 115, p: 9, c: 17, f: 0.4, tags: [], legume: true, prep: true },
  { id: "jambon", name: "Jambon blanc", kcal: 115, p: 20, c: 1, f: 3.5, tags: ["viande", "porc"] },
];
export const BREAKFAST_PROTEINS = [
  { id: "skyr", name: "Skyr", kcal: 63, p: 11, c: 4, f: 0.2, tags: ["lait"] },
  { id: "fromage-blanc", name: "Fromage blanc 0 %", kcal: 50, p: 7.5, c: 4, f: 0.2, tags: ["lait"] },
  { id: "oeufs-bf", name: "Œufs", kcal: 145, p: 12.5, c: 0.7, f: 10, tags: ["oeuf"], unit: { g: 55, label: "œuf" } },
  { id: "soja-dessert", name: "Yaourt au soja nature", kcal: 50, p: 4, c: 2, f: 2.5, tags: ["soja"] },
  { id: "whey", name: "Whey", kcal: 380, p: 78, c: 7, f: 5, tags: ["lait", "complement"], scoop: 30 },
];
export const CARBS = [
  { id: "riz", name: "Riz", kcal: 130, p: 2.7, c: 28, f: 0.3, tags: [], prep: true },
  { id: "pates", name: "Pâtes", kcal: 150, p: 5.5, c: 30, f: 0.9, tags: ["gluten"], prep: true },
  { id: "pdt", name: "Pommes de terre", kcal: 85, p: 2, c: 18, f: 0.1, tags: [], prep: true },
  { id: "patate-douce", name: "Patate douce", kcal: 90, p: 2, c: 20, f: 0.2, tags: [], prep: true },
  { id: "semoule", name: "Semoule", kcal: 112, p: 3.8, c: 23, f: 0.2, tags: ["gluten"], prep: true },
  { id: "quinoa", name: "Quinoa", kcal: 120, p: 4.4, c: 21, f: 1.9, tags: [], prep: true },
];
export const BREAKFAST_CARBS = [
  { id: "avoine", name: "Flocons d'avoine (cru)", kcal: 370, p: 13, c: 59, f: 7, tags: ["gluten"] },
  { id: "pain", name: "Pain complet", kcal: 245, p: 9, c: 42, f: 3, tags: ["gluten"] },
  { id: "galettes-riz", name: "Galettes de riz", kcal: 385, p: 8, c: 81, f: 3, tags: [] },
];
export const FRUITS = [
  { id: "banane", name: "Banane", kcal: 90, p: 1.1, c: 21, f: 0.3, tags: [], unit: { g: 120, label: "banane" } },
  { id: "pomme", name: "Pomme", kcal: 52, p: 0.3, c: 12, f: 0.2, tags: [], unit: { g: 150, label: "pomme" } },
  { id: "fruits-rouges", name: "Fruits rouges", kcal: 45, p: 1, c: 9, f: 0.4, tags: [] },
  { id: "dattes", name: "Dattes", kcal: 280, p: 2.5, c: 67, f: 0.4, tags: [] },
];
export const FATS = [
  { id: "huile", name: "Huile d'olive", kcal: 900, p: 0, c: 0, f: 100, tags: [], spoon: 10 },
  { id: "amandes", name: "Amandes", kcal: 600, p: 21, c: 9, f: 52, tags: ["fruits-a-coque"] },
  { id: "beurre-cacahuete", name: "Beurre de cacahuète", kcal: 600, p: 25, c: 14, f: 50, tags: ["arachide"], spoon: 15 },
  { id: "avocat", name: "Avocat", kcal: 160, p: 2, c: 2, f: 15, tags: [] },
];
export const VEG = [
  { id: "legumes-verts", name: "Haricots verts, brocoli ou courgette", kcal: 30, p: 2, c: 4, f: 0.3, tags: [] },
  { id: "crudites", name: "Crudités (tomate, carotte, salade)", kcal: 25, p: 1, c: 4, f: 0.2, tags: [] },
];

export const DIETS = [
  { id: "omni", label: "Je mange de tout", exclude: [] },
  { id: "sans-porc", label: "Sans porc / halal", exclude: ["porc"] },
  { id: "pesco", label: "Poisson oui, viande non", exclude: ["viande"] },
  { id: "vege", label: "Végétarien (œufs et laitages oui)", exclude: ["viande", "poisson"] },
  { id: "vegan", label: "Végétalien", exclude: ["viande", "poisson", "oeuf", "lait"] },
];
export const AVOID = [
  { id: "lait", label: "Produits laitiers" }, { id: "gluten", label: "Gluten" }, { id: "oeuf", label: "Œufs" },
  { id: "poisson", label: "Poisson" }, { id: "arachide", label: "Arachide" }, { id: "fruits-a-coque", label: "Fruits à coque" },
  { id: "soja", label: "Soja" }, { id: "complement", label: "Pas de whey ni de complément" },
];

// répartition de la journée selon le nombre de repas (part des glucides et des lipides de la journée)
export const MEAL_SLOTS = {
  3: [{ id: "breakfast", label: "Petit-déjeuner", carb: 0.3, fat: 0.3 }, { id: "lunch", label: "Déjeuner", carb: 0.4, fat: 0.35 }, { id: "dinner", label: "Dîner", carb: 0.3, fat: 0.35 }],
  4: [{ id: "breakfast", label: "Petit-déjeuner", carb: 0.25, fat: 0.25 }, { id: "lunch", label: "Déjeuner", carb: 0.3, fat: 0.3 }, { id: "snack", label: "Collation", carb: 0.2, fat: 0.15 }, { id: "dinner", label: "Dîner", carb: 0.25, fat: 0.3 }],
  5: [{ id: "breakfast", label: "Petit-déjeuner", carb: 0.2, fat: 0.2 }, { id: "snack", label: "Collation du matin", carb: 0.15, fat: 0.15 }, { id: "lunch", label: "Déjeuner", carb: 0.25, fat: 0.25 }, { id: "snack", label: "Collation de l'après-midi", carb: 0.15, fat: 0.1 }, { id: "dinner", label: "Dîner", carb: 0.25, fat: 0.3 }],
};

export const SOURCES_NUTRITION = "Repères : ISSN 2017 (protéines 1,4 à 2,0 g/kg par jour, environ 0,25 à 0,4 g/kg par repas toutes les 3 à 4 h), consensus ACSM / Dietitians of Canada / Academy of Nutrition and Dietetics 2016 (glucides selon la charge d'entraînement, repas 1 à 4 h avant l'effort).";
