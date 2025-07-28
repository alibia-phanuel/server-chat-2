export type ProductElementInput = {
  type: "text" | "image";
  content?: string;
  imageUrl?: string;
  caption?: string;
  order: number;
};

export type ProductInput = {
  id: string;
  name: string;
  createdBy: string;
  elements: ProductElementInput[];
};
