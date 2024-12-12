import { BomItem } from "./bomListItem"
import { Component } from "./component"
import { Module } from "./modules";

// Define the API response type
export interface ShoppingListTotalPriceResponse {
  total_min_price: number;
  total_max_price: number;
  total_price: number; // Deprecated
}

// BaseModel.ts (if needed for shared fields)
export interface BaseModel {
  id: string;
  created_at?: string; // ISO string for datetime
  updated_at?: string; // ISO string for datetime
}

// accounts/CustomUser.ts
export interface CustomUser {
  id: string;
  email: string;
  username: string;
  // Add other user-specific fields as needed
}

// accounts/UserNotes.ts
export interface UserNotes {
  id: string;
  note: string;
  // Add other note-specific fields as needed
}

// UserShoppingList.ts
export interface UserShoppingList {
  id: string;
  module_name: string;
  module: Module;
  component: Component;
  datetime_updated: string;
  datetime_created: string;
  quantity: number;
  bom_item: string;
  user: number;
}

// UserShoppingListSaved.ts
export interface UserShoppingListSaved extends BaseModel {
  timeSaved: string; // ISO string for datetime
  module?: Module | null;
  bomItem?: BomItem | null;
  component: Component;
  user: CustomUser;
  quantity: number;
  name?: string;
  notes?: UserNotes | null;
}

export interface GroupedByModule {
  name: string;
  moduleId?: string;
  data: Record<string, UserShoppingList[]>;
}

export interface AggregatedComponent {
  id: string;
  module: string | null;
  module_name: string | null;
  component: Component;
  datetime_updated: string;
  datetime_created: string;
  quantity: number;
  bom_item: string | null;
  user: number;
}

export interface UseUserShoppingListData {
  groupedByModule: GroupedByModule[];
  aggregatedComponents: UserShoppingList[];
}
