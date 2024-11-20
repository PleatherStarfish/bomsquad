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

export interface Component {
  id: string;
  description: string;
  manufacturer?: ComponentManufacturer;
  manufacturer_part_no?: string;
  mounting_style?: string;
  supplier?: ComponentSupplier;
  supplier_item_no?: string;
  supplier_has_no_item_no?: boolean;
  type: Types;
  ohms?: number;
  ohms_unit?: string;
  farads?: number;
  farads_unit?: string;
  voltage_rating?: string;
  current_rating?: string;
  forward_voltage?: string;
  max_forward_current?: string;
  tolerance?: string;
  price: number;
  pcs: number;
  discontinued: boolean;
  notes?: string;
  link: string;
  allow_comments: boolean;
  unit_price?: number;
}
