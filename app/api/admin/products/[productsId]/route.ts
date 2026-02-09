import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { UTApi } from 'uploadthing/server';
import { updateProductSchema } from '@/lib/schema/adminSchema';

export async function GET(req: Request, { params }: { params: Promise<{ productsId: string }> }) {
  try {
    const { productsId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productsId },
      include: {
        variantTypes: {
          include: {
            values: true,
          },
        },
        combinations: {
          include: {
            values: {
              include: {
                variantValue: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[GET /api/admin/products/[productsId]]', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productsId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { success: false, error: true, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { productsId } = await params;

    // Create UTApi instance inside the function
    const utapi = new UTApi();

    // 1. Find all images for this product
    const images = await prisma.productImage.findMany({
      where: { productId: productsId },
    });

    // 2. Delete all files from UploadThing
    const keysToDelete = images.map(img => img.key);
    if (keysToDelete.length > 0) {
      const result = await utapi.deleteFiles(keysToDelete);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to delete image(s) from UploadThing' },
          { status: 500 }
        );
      }
    }

    // 3. Delete product (and Prisma will cascade delete productImages)
    await prisma.product.delete({
      where: { id: productsId },
    });

    return NextResponse.json(
      { success: true, error: false, message: 'Product deleted successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/products/[productsId]]', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productsId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { success: false, error: true, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { productsId } = await params;
    const parsed = updateProductSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productsId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, error: false, product: updatedProduct });
  } catch (error) {
    console.error('[PUT /api/admin/products/:productId]', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}
