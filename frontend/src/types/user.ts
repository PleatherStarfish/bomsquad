import { Currency } from "./currency"

interface KofiPayment {
  kofi_transaction_id: string; // UUID format
  email: string;
  tier_name?: string;
  timestamp?: string; // ISO 8601 date format
  type?: string;
  is_public: boolean;
  from_name?: string;
  message?: string;
  amount?: string;
  url?: string;
  currency?: string;
  is_first_subscription_payment: boolean;
}

interface UserNotes {
  id: string; // UUID format
  note: string;
  want_to_build_module_id?: number; // Foreign key ID
  built_module_id?: number; // Foreign key ID
  user_shopping_list_saved_id?: number; // Foreign key ID
}

interface EmailAddress {
  email: string;
  verified: boolean;
  primary: boolean;
}

export interface UserCurrency {
  default_currency: Currency;
  currency_name: string;
  exchange_rate: number;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  emails: EmailAddress[];
  date_joined: string; // ISO 8601 format (e.g., "2023-01-01T00:00:00Z")
  default_currency: Currency;
  end_of_premium_display_date?: string | null; // Nullable ISO 8601 date
  is_premium: boolean;
  unique_module_ids: number[];
  history: any[]; // JSON field, can be structured or unstructured data
  premium_admin_override: boolean;
  premium_until?: string | null; // ISO 8601 date
  premium_until_via_kofi?: string | null; // ISO 8601 date
  premium_until_via_patreon?: string | null; // ISO 8601 date
}

export { KofiPayment, UserNotes, EmailAddress, User };
