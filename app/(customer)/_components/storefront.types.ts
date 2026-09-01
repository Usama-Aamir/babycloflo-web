export type ProductSummary = {
  id: string;
  name: string;
  base_images: string[] | null;
  product_variants: {
    price: number;
    size: string;
  }[];
};

export type CategoryTileData = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type ProductColor = {
  id: string;
  color_name: string;
  swatch_image_url: string | null;
};

export type ProductVariant = {
  id: string;
  size: string;
  finish: string | null;
  price: number;
  stock_status: string;
  variant_colors: ProductColor[];
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  base_images: string[] | null;
  product_variants: ProductVariant[];
};
