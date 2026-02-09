// /api/admin/products.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createProductSchema } from '@/lib/schema/adminSchema';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const {
      name,
      description,
      price,
      stock,
      imageUrl,
      subCategoryId,
      manufacturers,
      type,
      packaging,
      package: pkg,
      Qty,
      productForm,
      productHighlights,
      information,
      keyIngredients,
      keyBenefits,
      directionsForUse,
      safetyInformation,
      manufacturerAddress,
      countryOfOrigin,
      manufacturerDetails,
      marketerDetails,
    } = parsed.data;

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: 'products',
    });

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl: uploadResponse.secure_url,
        subCategoryId,
        manufacturers,
        type,
        packaging,
        package: pkg,
        Qty,
        productForm,
        productHighlights,
        information,
        keyIngredients,
        keyBenefits,
        directionsForUse,
        safetyInformation,
        manufacturerAddress,
        countryOfOrigin,
        manufacturerDetails,
        marketerDetails,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      variantTypes: true,
      combinations: true,
    },
  });
  return NextResponse.json(products);
}
