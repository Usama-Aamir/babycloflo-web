export type ProductStatus = "draft" | "active";
export type StockStatus = "in_stock" | "out_of_stock";

export type ColorDraft = {
  key: string;
  colorName: string;
  swatchImageUrl: string;
};

export type VariantDraft = {
  key: string;
  size: string;
  finish: string;
  price: string;
  stockStatus: StockStatus;
  colors: ColorDraft[];
};

export type ProductDraft = {
  baseImages: string[];
  name: string;
  categoryId: string;
  isGiftable: boolean;
  description: string;
  status: ProductStatus;
  variants: VariantDraft[];
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type ProductFormResult = {
  error?: string;
};
