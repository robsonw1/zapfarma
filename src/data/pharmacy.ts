// 💊 DADOS DE FARMÁCIA - Medicamentos e Receitas
// Pivot completo: Pizzaria → Farmácia

export interface Medication {
  id: string;
  name: string;
  description: string;
  active_ingredient: string;
  category: 'analgesicos' | 'antibioticos' | 'anti_inflamatorio' | 'vitaminas' | 'cosmeticos' | 'higiene' | 'gastrointestinal' | 'generico';
  price: number;
  image?: string;
  is_active: boolean;
  requires_recipe?: boolean;
  is_controlled?: boolean;
  stock?: number;
  max_quantity_per_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Receipt {
  id: string;
  customer_id: string;
  medication_id: string;
  medication_name: string;
  doctor_name: string;
  doctor_crm?: string;
  dosage: string;
  quantity: number;
  date_issued: string;
  date_expires: string;
  image_url?: string;
  is_verified: boolean;
  status: 'pendente' | 'verificada' | 'rejeitada';
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationCartItem {
  id: string;
  medication: Medication;
  quantity: number;
  receipt_id?: string;
  receipt?: Receipt;
  notes?: string;
  totalPrice: number;
}

// Para compatibilidade com componentes que usam "Product"
export type Product = Medication;

export const medicationCategories = {
  analgesicos: 'Analgésicos',
  antibioticos: 'Antibióticos',
  anti_inflamatorio: 'Anti-inflamatórios',
  vitaminas: 'Vitaminas',
  cosmeticos: 'Cosméticos',
  higiene: 'Higiene',
  gastrointestinal: 'Gastrointestinal',
  generico: 'Genéricos',
};

export const categoryLabels: Record<string, string> = medicationCategories;

// Medicamentos mock para desenvolvimento
export const medications: Medication[] = [
  {
    id: 'med-dipirona-500',
    name: 'Dipirona 500mg',
    description: 'Frasco c/ 20 comprimidos. Analgésico e antitérmico',
    active_ingredient: 'Dipirona Monoidratada',
    category: 'analgesicos',
    price: 12.90,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 150,
  },
  {
    id: 'med-ibuprofeno-600',
    name: 'Ibuprofeno 600mg',
    description: 'Blister c/ 10 comprimidos. Anti-inflamatório',
    active_ingredient: 'Ibuprofeno',
    category: 'anti_inflamatorio',
    price: 25.50,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 120,
  },
  {
    id: 'med-vitamina-c',
    name: 'Vitamina C 1000mg',
    description: 'Frasco c/ 60 comprimidos efervescentes',
    active_ingredient: 'Ácido Ascórbico',
    category: 'vitaminas',
    price: 22.00,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 200,
  },
  {
    id: 'med-paracetamol-750',
    name: 'Paracetamol 750mg',
    description: 'Frasco c/ 30 comprimidos',
    active_ingredient: 'Paracetamol',
    category: 'analgesicos',
    price: 18.00,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 100,
  },
  {
    id: 'med-vitamina-d3',
    name: 'Vitamina D3 2000UI',
    description: 'Frasco c/ 60 cápsulas',
    active_ingredient: 'Colecalciferol',
    category: 'vitaminas',
    price: 35.90,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 80,
  },
  {
    id: 'med-amoxicilina-500',
    name: 'Amoxicilina 500mg',
    description: 'Cápsula c/ 21 unidades. Antibiótico',
    active_ingredient: 'Amoxicilina Trihidratada',
    category: 'antibioticos',
    price: 35.00,
    is_active: true,
    requires_recipe: true,
    is_controlled: false,
    stock: 80,
    max_quantity_per_order: 1,
  },
  {
    id: 'med-enxaguante',
    name: 'Enxaguante Bucal 500ml',
    description: 'Antisséptico com flúor',
    active_ingredient: 'Clorexidina 0.12%',
    category: 'higiene',
    price: 15.00,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 200,
  },
  {
    id: 'med-mascara-50',
    name: 'Máscara Cirúrgica 50un',
    description: 'Caixa com 50 unidades',
    active_ingredient: 'Não tecido + Meltblown',
    category: 'higiene',
    price: 12.00,
    is_active: true,
    requires_recipe: false,
    is_controlled: false,
    stock: 500,
  },
  {
    id: 'med-omeprazol-20',
    name: 'Omeprazol 20mg',
    description: 'Cápsula c/ 14 unidades',
    active_ingredient: 'Omeprazol',
    category: 'gastrointestinal',
    price: 32.00,
    is_active: true,
    requires_recipe: true,
    is_controlled: false,
    stock: 90,
  },
];

export const recipeMedicines = medications.filter(m => m.requires_recipe);
export const controlledMedicines = medications.filter(m => m.is_controlled);
