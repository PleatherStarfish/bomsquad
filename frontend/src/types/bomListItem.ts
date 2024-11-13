export interface Manufacturer {
  id: string;
  link?: string;
  name: string;
  notes?: string;
  slug: string;
}

export interface PcbVersion {
  id: string;
  module: string; // Assume this is the Module's ID
  order: number;
  version: string;
}

export interface Component {
  id: string;
  name: string;
  type: string; // Assuming type is a string here; adjust as needed // Assuming type is a string here; adjust as needed
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
  rating: number; // Between 1 and 5
  user: string; // User ID // Between 1 and 5
}
