// 🏥 PharmaDrive - Complete Medication Catalog
// Migrada de Pizzaria Forneiro Eden
// Last updated: 23/03/2026

export interface Medication {
  id: string;
  name: string;
  description: string;
  activeIngredient: string;
  category: 'analgesicos' | 'antibioticos' | 'anti_inflamatorio' | 'vitaminas' | 'cosmeticos' | 'higiene' | 'homeopatia' | 'generico';
  price: number;
  image?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isActive: boolean;
  requiresRecipe: boolean; // Requer receita médica
  isControlled: boolean; // Medicamento controlado (tarja preta)
  stock: number;
  maxQuantityPerOrder?: number;
}

export interface Receipt {
  id: string;
  customerId: string;
  medicationId: string;
  medicationName: string;
  doctorName: string;
  doctorCRM?: string;
  dosage: string;
  quantity: number;
  dateIssued: string;
  dateExpires: string;
  imageUrl?: string;
  isVerified: boolean;
  status: 'pendente' | 'verificada' | 'rejeitada';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationCartItem {
  id: string;
  medication: Medication;
  quantity: number;
  receiptId?: string;
  receipt?: Receipt;
  notes?: string;
  totalPrice: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  deliveryFee: number;
  isActive: boolean;
}

// 🏥 MOCK DATA - Medicamentos
export const medications: Medication[] = [
  {
    id: 'med-dipirona-500',
    name: 'Dipirona 500mg',
    description: 'Analgésico e antitérmico. Frasco com 20 comprimidos',
    activeIngredient: 'Dipirona Monoidratada 500mg',
    category: 'analgesicos',
    price: 12.90,
    isPopular: true,
    isActive: true,
    requiresRecipe: false,
    isControlled: false,
    stock: 150,
  },
  {
    id: 'med-ibupirofeno-600',
    name: 'Ibuprofeno 600mg',
    description: 'Anti-inflamatório. Blister com 10 comprimidos',
    activeIngredient: 'Ibuprofeno 600mg',
    category: 'anti_inflamatorio',
    price: 25.50,
    isPopular: true,
    isNew: false,
    isActive: true,
    requiresRecipe: false,
    isControlled: false,
    stock: 120,
  },
  {
    id: 'med-amoxicilina-500',
    name: 'Amoxicilina 500mg',
    description: 'Antibiótico Beta-lactamânico. Cápsula com 21 unidades',
    activeIngredient: 'Amoxicilina Trihidratada 500mg',
    category: 'antibioticos',
    price: 35.00,
    isPopular: true,
    isActive: true,
    requiresRecipe: true,
    isControlled: false,
    stock: 80,
  },
  {
    id: 'med-losartana-50',
    name: 'Losartana 50mg',
    description: 'Anti-hipertensivo. Blister com 30 comprimidos',
    activeIngredient: 'Losartana Potássica 50mg',
    category: 'generico',
    price: 28.00,
    isActive: true,
    requiresRecipe: true,
    isControlled: false,
    stock: 95,
  },
  {
    id: 'med-ritalina-10',
    name: 'Ritalina 10mg',
    description: 'Estimulante. Blister com 30 comprimidos',
    activeIngredient: 'Metilfenidato 10mg',
    category: 'generico',
    price: 120.00,
    isActive: true,
    requiresRecipe: true,
    isControlled: true,
    stock: 25,
    maxQuantityPerOrder: 1,
  },
  {
    id: 'med-vitamina-c',
    name: 'Vitamina C 1000mg',
    description: 'Suplemento vitamínico. Frasco com 60 comprimidos',
    activeIngredient: 'Ácido Ascórbico 1000mg',
    category: 'vitaminas',
    price: 22.00,
    isNew: true,
    isActive: true,
    requiresRecipe: false,
    isControlled: false,
    stock: 200,
  },
  {
    id: 'med-dipirona-injecao',
    name: 'Dipirona Injeção 500mg/ml',
    description: 'Para administração IV/IM. Ampola com 2ml',
    activeIngredient: 'Dipirona Monoidratada 500mg/ml',
    category: 'analgesicos',
    price: 8.50,
    isActive: true,
    requiresRecipe: true,
    isControlled: false,
    stock: 60,
  },
  {
    id: 'med-almofada-gel',
    name: 'Almofada Térmica Gel',
    description: 'Reutilizável, quente/frio. Ideal para dores',
    activeIngredient: 'Gel cristal',
    category: 'cosmeticos',
    price: 35.90,
    isActive: true,
    requiresRecipe: false,
    isControlled: false,
    stock: 45,
  },
  {
    id: 'med-enxaguante-bucal',
    name: 'Enxaguante Bucal 500ml',
    description: 'Antisséptico. Bottle de 500ml',
    activeIngredient: 'Clorexidina 0.12%',
    category: 'higiene',
    price: 15.00,
    isActive: true,
    requiresRecipe: false,
    isControlled: false,
    stock: 120,
  },
  {
    id: 'med-mascara-cirurgica',
    name: 'Máscara Cirúrgica 50un',
    description: 'Proteção respiratória. Caixa com 50 unidades',
    activeIngredient: 'Melt-blown + tecido não tecido',
    category: 'higiene',
    price: 12.00,
    isPopular: true,
    isActive: true,
    requiresRecipe: false,
    isControlled: false,
    stock: 500,
  },
];

// 📂 Categorias
export const medicationCategories = [
  { id: 'analgesicos', name: '💊 Analgésicos' },
  { id: 'antibioticos', name: '🦠 Antibióticos' },
  { id: 'anti_inflamatorio', name: '🔥 Anti-inflamatórios' },
  { id: 'vitaminas', name: '🌿 Vitaminas' },
  { id: 'higiene', name: '🧼 Higiene' },
  { id: 'cosmeticos', name: '💄 Cosméticos' },
  { id: 'homeopatia', name: '🌾 Homeopatia' },
  { id: 'generico', name: '⚕️ Genéricos' },
];

// 🏘️ Bairros para entrega (REUTILIZADO DO SISTEMA ANTERIOR)
export const neighborhoodsData: Neighborhood[] = [
  { id: '1', name: 'Centro', deliveryFee: 5.00, isActive: true },
  { id: '2', name: 'Vila Norte', deliveryFee: 7.00, isActive: true },
  { id: '3', name: 'Jardim Sul', deliveryFee: 6.50, isActive: true },
  { id: '4', name: 'Zona Industrial', deliveryFee: 8.00, isActive: true },
];

// 📋 Filtros e utilitários
export const recipeMedicines = medications.filter(m => m.requiresRecipe);
export const controlledMedicines = medications.filter(m => m.isControlled);

export interface CartItem {
  id: string;
  medication: Medication;
  quantity: number;
  receiptId?: string;
  receipt?: Receipt;
  notes?: string;
  totalPrice: number;
}
