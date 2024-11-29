export interface DropdownOptions {
  types: { id: string; name: string }[];
  manufacturers: { id: string; name: string }[];
  suppliers: { id: string; short_name: string }[];
  categories: { id: string; name: string }[];
  sizes: { id: string; name: string }[];
}

export interface AddComponentFormInputs {
  manufacturer: string; // Manufacturer ID
  manufacturer_part_no: string;
  mounting_style?: { label: string; value: string };
  type: string;
  category?: string;
  size?: string;
  ohms?: number;
  ohms_unit?: string;
  farads?: number;
  farads_unit?: string;
  voltage_rating?: string;
  current_rating?: string;
  wattage?: string;
  forward_voltage?: string;
  max_forward_current?: string;
  tolerance?: string;
  supplier_items?: SupplierItemInput[]; // Nested supplier items
  quantity?: number;
}

export interface SupplierItemInput {
  supplier: string; // Supplier ID
  supplier_item_no?: string;
  price: number;
  currency: string;
  pcs: number;
  link: string;
}

export type TransformedComponentData = {
  component: AddComponentFormInputs;
  quantity?: number;
  supplier_items: SupplierItemInput[];
}
