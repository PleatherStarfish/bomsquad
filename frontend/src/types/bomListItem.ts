export interface Manufacturer {
  id: string;
  link?: string;
  name: string;
  notes?: string;
  slug: string;
}

export interface PcbVersion {
  id: string;
  module: string;
  order: number;
  version: string;
}

export interface Component {
  id: string; // UUID
  description: string; // Description of the component
  manufacturer?: {
    id: string; // UUID of the manufacturer
    name: string; // Manufacturer's name
  } | null;
  manufacturer_part_no?: string; // Manufacturer's part number
  manufacturer_link?: string; // Link to the manufacturer's page
  mounting_style?: "smt" | "th"; // Mounting style: Surface Mount (SMT) or Through Hole (TH)
  supplier?: {
    id: string; // UUID of the supplier
    name: string; // Supplier's full name
    short_name: string; // Supplier's short name
    url: string; // URL to the supplier's website
  } | null;
  supplier_item_no?: string | null; // Supplier's item number
  supplier_has_no_item_no?: boolean; // Whether the supplier has no item number
  type: string;
  category?: {
    id: string; // UUID of the category
    name: string; // Name of the category
    parent?: string; // ID of the parent category, if applicable
  } | null;
  size?: {
    id: string; // UUID of the size standard
    name: string; // Name of the size standard (e.g., 0805, SOIC14)
  } | null;
  ohms?: number | null; // Resistance value in Ohms
  ohms_unit?: "kΩ" | "MΩ" | "Ω"; // Resistance unit
  farads?: number | null; // Capacitance value in Farads
  farads_unit?: "mF" | "nF" | "pF" | "μF"; // Capacitance unit
  voltage_rating?: string; // Voltage rating of the component
  current_rating?: string; // Current rating of the component
  forward_current?: string | null; // Maximum forward current (e.g., for diodes)
  forward_voltage?: string | null; // Forward voltage drop
  forward_surge_current?: string | null; // Maximum forward surge current
  forward_current_avg_rectified?: string | null; // Average forward current rectified
  tolerance?: string | null; // Tolerance of the component
  price?: {
    amount: number; // Price value
    currency: string; // Currency of the price (e.g., USD)
  };
  pcs: number; // Number of components per price unit
  unit_price: number; // Price per single component unit
  discontinued: boolean; // Whether the component is discontinued
  notes?: string; // Additional notes
  link: string; // Link to the component's details
  allow_comments: boolean; // Whether comments are allowed for this component
  user_submission_hold: boolean; // Whether user submissions are on hold
}


export interface Module {
  allow_comments: boolean;
  bom_link?: string;
  bom_under_construction: boolean;
  category?: "Eurorack" | "Pedals" | "Serge"; // Categories
  description: string;
  discontinued: boolean;
  hp?: number; // Width in HP
  id: string;
  image?: string;
  large_image_jpeg?: string;
  large_image_webp?: string;
  manual_link?: string;
  manufacturer: Manufacturer;
  manufacturer_page_link?: string;
  modulargrid_link?: string;
  mounting_style?: "smt" | "th"; // "Surface Mount (SMT)" or "Through Hole"
  name: string;
  rack_unit?: "3U" | "4U" | "5U"; // Rack unit choices
  slug: string;
  thumb_image_jpeg?: string;
  thumb_image_webp?: string;
  version: string;
}

export interface BomItem {
  components_options: string[];
  description: string;
  designators: string;
  id: string;
  module: Module;
  notes: string;
  optional: boolean;
  pcb_version: PcbVersion[];
  quantity: number;
  sum_of_user_options_from_inventory?: number | null;
  sum_of_user_options_from_shopping_list?: number | null;
  type: Types;
  bom_specifies_a_choice_of_values?: boolean;
  bom_link?: string;
  moduleId: string;
  moduleName: string;
}

export interface Types {
  description?: string;
  id: string;
  name: string;
}

export interface BomListProps {
  bomUnderConstruction: boolean;
  moduleId: string;
  moduleName: string;
}

export interface WantToBuildModules {
  id: string;
  module: Module;
  user: string; // User ID
}

export interface BuiltModules {
  id: string;
  module: Module;
  user: string; // User ID
}

export interface ModuleBomListComponentForItemRating {
  component: Component;
  id: string;
  module_bom_list_item: BomItem;
  rating: number;
  user: string; 
}
