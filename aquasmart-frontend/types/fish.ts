export type FishGeneral = {
  name: string;
  slug: string;
  short_description?: string | null;
  type?: string | null;
  category?: string | null;
  habitat?: string | null;
  origin?: string | null;
  identify_text?: string | null;
  average_lifespan?: string | null;
  adult_size?: string | null;
  cover_image_url?: string | null;
  is_active: boolean;
};

export type FishFarmer = {
  how_to_raise?: string | null;
  pond_type?: string | null;
  pond_size?: string | null;
  population_per_pond?: string | null;
  water_temp?: string | null;
  ph?: string | null;
  water_prep?: string | null;
  source_type?: string | null;
  source_size?: string | null;
  system_type?: string | null;
  compatible_species?: string | null;
  incompatible_species?: string | null;
  growth_rate?: string | null;
  survival_rate?: string | null;
  common_diseases?: string | null;
  disease_prevention?: string | null;
  recommended_food?: string | null;
  not_recommended_food?: string | null;
  feeding_amount?: string | null;
  feeding_frequency?: string | null;
  notes?: string | null;
};

export type FishOrnamental = {
  environment?: string | null;
  population?: string | null;
  water_temp?: string | null;
  ph?: string | null;
  preparation?: string | null;
  source_type?: string | null;
  source_size?: string | null;
  system_type?: string | null;
  compatible_species?: string | null;
  incompatible_species?: string | null;
  growth_rate?: string | null;
  survival_rate?: string | null;
  common_diseases?: string | null;
  disease_prevention?: string | null;
  recommended_food?: string | null;
  not_recommended_food?: string | null;
  feeding_amount?: string | null;
  feeding_frequency?: string | null;
  notes?: string | null;
};

export type FishPayload = {
  general: FishGeneral;
  farmer?: FishFarmer;
  ornamental?: FishOrnamental;
};

export type FishSpeciesRow = {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  type?: string | null;
  category?: string | null;
  habitat?: string | null;
  origin?: string | null;
  identify_text?: string | null;
  average_lifespan?: string | null;
  adult_size?: string | null;
  cover_image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FishImageRow = {
  id: number;
  fish_id: number;
  image_url: string;
  alt_text?: string | null;
  is_cover: boolean;
  created_at?: string;
};

export type FishDetailResponse = {
  fish: FishSpeciesRow;
  farmer_info?: FishFarmer | null;
  ornamental_info?: FishOrnamental | null;
  images?: FishImageRow[];
};

export type PredictFishResponse = {
  predicted_class?: string;
  confidence_percent?: number;
  confidence?: number;
  fish?: FishSpeciesRow;
  fish_detail?: FishDetailResponse;
  all_probabilities?: Record<string, number>;
  [key: string]: unknown;
};
