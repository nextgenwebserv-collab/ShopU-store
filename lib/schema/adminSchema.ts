// lib/validations/adminSchemas.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});
export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});
export const updateSubCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().uuid('Valid categoryId required'),
});
export const createSubCategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required'),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().min(1),
  subCategoryId: z.string().uuid(),

  manufacturers: z.string().optional(),
  type: z.string().optional(),
  packaging: z.string().optional(),
  package: z.string().optional(),
  Qty: z.string().optional(),
  productForm: z.string().optional(),
  productHighlights: z.string().optional(),
  information: z.string().optional(),
  keyIngredients: z.string().optional(),
  keyBenefits: z.string().optional(),
  directionsForUse: z.string().optional(),
  safetyInformation: z.string().optional(),
  manufacturerAddress: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  manufacturerDetails: z.string().optional(),
  marketerDetails: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().min(1),
  subCategoryId: z.string().uuid().optional(),

  manufacturers: z.string().optional(),
  type: z.string().optional(),
  packaging: z.string().optional(),
  package: z.string().optional(),
  Qty: z.string().optional(),
  productForm: z.string().optional(),
  productHighlights: z.string().optional(),
  information: z.string().optional(),
  keyIngredients: z.string().optional(),
  keyBenefits: z.string().optional(),
  directionsForUse: z.string().optional(),
  safetyInformation: z.string().optional(),
  manufacturerAddress: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  manufacturerDetails: z.string().optional(),
  marketerDetails: z.string().optional(),
});

export const createVariantTypeSchema = z.object({
  name: z.string().min(1),
});

export const updateVariantTypeSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
});

export const createVariantValueSchema = z.object({
  value: z.string().min(1),
  variantTypeId: z.string().uuid().nonempty(),
});

export const updateVariantValueSchema = z.object({
  value: z.string().min(1, 'Value is required'),
});

export const createCombinationSchema = z.object({
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  variantValueIds: z.array(z.string().uuid()).nonempty(),
});

export const updateCombinationSchema = z.object({
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  variantValueIds: z.array(z.string().uuid()).nonempty().optional(),
});
