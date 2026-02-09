import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Add product to wishlist
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, image_url, productId } = body;

  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: true, message: 'Please login first' },
      { status: 401 }
    );
  }

  //Decode token and get userId
  const payload = verifyToken(token);
  const userId = payload.id;

  if (!name || !image_url || !productId) {
    return NextResponse.json(
      { success: false, error: true, message: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.wishlist.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: true, message: 'Already in wishlist' },
        { status: 400 }
      );
    }

    const item = await prisma.wishlist.create({
      data: {
        name,
        image_url,
        productId,
        userId,
      },
    });

    return NextResponse.json(
      { success: true, error: false, message: 'Added to wishlist', data: item },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

//Get products
export async function GET(req: NextRequest) {
  try {
    //Get token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: true, message: 'Please login first' },
        { status: 401 }
      );
    }

    //Decode token and get userId
    const payload = verifyToken(token);
    const userId = payload.id;

    //Query wishlist for the specific user
    const items = await prisma.wishlist.findMany({
      where: {
        is_active: true,
        userId: userId,
      },
      include: {
        product: {
          select: {
            stock: true,
            price: true,
          },
        },
      },
    });

    // Map to send stock along with wishlist item
    const response = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.product?.price ?? 0,
      image_url: item.image_url,
      productId: item.productId,
      createdAt: item.createdAt,
      stock: item.product?.stock ?? 0,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

//Delete product to wishlist
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { success: false, error: true, message: 'Product ID is required' },
      { status: 400 }
    );
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: true, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  const userId = payload?.id;

  try {
    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        productId,
        userId,
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { success: false, error: true, message: 'Item not found in wishlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, error: false, message: 'Removed from wishlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
