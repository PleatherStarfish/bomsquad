export interface Types {
  id: string;
  name: string;
  notes?: string;
}

export interface ComponentSupplier {
  id: string;
  name: string;
  short_name: string;
  url: string;
}

export interface ComponentManufacturer {
  id: string;
  name: string;
}

export interface ComponentSupplierItem {
  id: string;
  supplier: ComponentSupplier;
  supplier_item_no?: string;
  price?: number;
  unit_price?: number;
  pcs: number;
  link?: string;
}

export interface Component {
  id: string;
  description: string;
  manufacturer?: {
    id: string;
    name: string;
  } | null;
  manufacturer_part_no?: string;
  manufacturer_link?: string;
  mounting_style?: "smt" | "th"; 
  supplier?: {
    id: string;
    name: string;
    short_name: string;
    url: string;
  } | null;
  supplier_item_no?: string | null;
  supplier_has_no_item_no?: boolean;
  type: Types;
  category?: {
    id: string;
    name: string;
    parent?: string;
  } | null;
  size?: {
    id: string;
    name: string;
  } | null;
  ohms?: number | null;
  ohms_unit?: "kΩ" | "MΩ" | "Ω"; 
  farads?: number | null; 
  farads_unit?: "mF" | "nF" | "pF" | "μF";
  voltage_rating?: string; 
  current_rating?: string;
  forward_voltage?: string | null;
  max_forward_current?: string | null; 
  tolerance?: string | null;
  price?: {
    amount: number;
    currency: string; 
  };
  pcs: number;
  unit_price: number; 
  discontinued: boolean; 
  notes?: string;
  link: string; 
  allow_comments: boolean;
  user_submission_hold: boolean;
  supplier_items?: ComponentSupplierItem[];
}

