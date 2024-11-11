export type UUID = string;

// Manufacturer-related types
export interface ComponentManufacturer {
  name: string;
}

export interface Manufacturer {
  name: string;
  link: string | null;
}

export interface ModuleManufacturer extends Manufacturer {
  slug: string;
}

// Component-related types
export interface Component {
  id: UUID;
  name: string;
  type: Types;
}

export interface Types {
  name: string;
}

export interface ComponentSupplier {
  name: string;
  short_name: string;
  url: string;
}

// PCB Version type
export interface PcbVersion {
  id: UUID;
  module: UUID;
  version: string;
  order: number;
}

// Module and BOM-related types
export interface Module {
  id: UUID;
  name: string;
  manufacturer_name: string;
  manufacturer_slug: string;
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
  mounting_style?: "smt" | "th";
  discontinued: boolean;
  bom_under_construction: boolean;
  rack_unit?: "3U" | "4U" | "5U";
  hp?: number;
  category?: "Eurorack" | "Pedals" | "Serge";
  slug: string;
  allow_comments: boolean;
}

export interface ModuleBomListItem {
  id: UUID;
  description: string;
  components_options: Component[];
  module: UUID;
  pcb_version: PcbVersion[];
  type: string;
  designators: string;
  quantity: number;
  bom_specifies_a_choice_of_values: boolean;
  notes: string;
  sum_of_user_options_from_inventory?: number;
  sum_of_user_options_from_shopping_list?: number;
  bom_link?: string;
}

export interface ModuleBomListComponentForItemRating {
  module_bom_list_item: UUID;
  component: UUID;
  rating: number;
}

// User-specific module states
export interface WantToBuildModule {
  id: UUID;
  module: Module;
}

export interface BuiltModule {
  id: UUID;
  module: Module;
}

// Filter parameter types for API requests
export interface ModuleFilterParams {
  search?: string;
  manufacturer?: string;
  component_type?: string;
  category?: string;
  rack_unit?: string;
  mounting_style?: string;
  component_groups?: {
    component: string;
    component_description?: string;
    min: number | undefined;
    max: number | undefined;
  }[];
  page?: number;
}

// API response types for filter options
export interface FilterOption {
  name: string;
  value: string;
}

export interface FilterOptions {
  manufacturers: Manufacturer[];
  mountingStyleOptions: FilterOption[];
  categoryOptions: FilterOption[];
  rackUnitOptions: FilterOption[];
}

// Pagination type for response
export interface Pagination {
  currentPage: number;
  nextPage: number | null;
  hasNextPage: boolean;
  totalPages: number;
  totalItems: number;
}

export interface ModuleResponse {
  modules: Module[];
  pagination: Pagination;
  filterOptions: FilterOptions;
  zipped_components: Array<
    [string | null, string | null, string | null, string | null]
  >;
}
