export interface Manufacturer {
  id: string;
  name: string;
  link?: string;
  notes?: string;
  slug: string;
}

export interface PcbVersion {
  id: string;
  module: string; // Assume this is the Module's ID
  version: string;
  order: number;
}

export interface Component {
  id: string;
  name: string;
  type: string; // Assuming type is a string here; adjust as needed
}

export interface Module {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  version: string;
  description: string;
  image?: string;
  thumb_image_webp?: string;
  thumb_image_jpeg?: string;
  large_image_webp?: string;
  large_image_jpeg?: string;
  manufacturer_page_link?: string;
  bom_link?: string;
  manual_link?: string;
  modulargrid_link?: string;
  mounting_style?: "smt" | "th"; // "Surface Mount (SMT)" or "Through Hole"
  discontinued: boolean;
  rack_unit?: "3U" | "4U" | "5U"; // Rack unit choices
  hp?: number; // Width in HP
  category?: "Eurorack" | "Pedals" | "Serge"; // Categories
  slug: string;
  allow_comments: boolean;
}

export interface BomItem {
  id: string;
  description: string;
  components_options: string[];
  module: Module;
  pcb_version: PcbVersion[];
  type: Types;
  designators: string;
  quantity: number;
  notes: string;
  sum_of_user_options_from_inventory?: number | null;
  sum_of_user_options_from_shopping_list?: number | null;
}

export interface Types {
  id: string;
  name: string;
  description?: string;
}

export interface BomListProps {
  moduleId: string;
  moduleName: string;
}

export interface WantToBuildModules {
  id: string;
  user: string; // User ID
  module: Module;
}

export interface BuiltModules {
  id: string;
  user: string; // User ID
  module: Module;
}

export interface ModuleBomListComponentForItemRating {
  id: string;
  module_bom_list_item: BomItem;
  component: Component;
  user: string; // User ID
  rating: number; // Between 1 and 5
}
