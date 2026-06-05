export interface Seller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property_type: string;
  state: string;
  city: string;
  area: string;
  price: string;
  status: string;
  notes?: string;
  bedrooms?: string;
  bathrooms?: string;
  builtup_area?: string;
  additional_spaces?: string;
  possession_status?: string;
  facing?: string;
  parking?: string;
  description?: string;
  tags?: string;
  furnishing?: string;
  balconies?: string;
  property_age?: string;
  follow_up_date?: string | null;
  listing_purpose?: string;
  image_urls?: string[];
  created_at: string;
}

export interface SettingOption {
  value: string;
  display_name: string;
}
