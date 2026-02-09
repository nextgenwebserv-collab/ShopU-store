import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

// GET - fetch all cart items for the logged in user
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    // Use cached headers to allow browser caching
    const cacheControl = req.headers.get('Cache-Control');
    if (cacheControl === 'no-cache') {
      // This is a forced refresh, skip the cache check
    } else {
      // Generate an ETag based on user ID
      const eTag = `"cart-${userId}"`;
      const ifNoneMatch = req.headers.get('If-None-Match');

      // Check if client has a valid cached version
      if (ifNoneMatch === eTag) {
        return new NextResponse(null, {
          status: 304, // Not Modified
          headers: {
            ETag: eTag,
            'Cache-Control': 'private, max-age=60',
          },
        });
      }
    }

    // More optimized query with only necessary fields
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      select: {
        id: true,
        quantity: true,
        productId: true,
        medicineId: true,
        addedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            manufacturerName: true,
            packSizeLabel: true,
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    // Generate an ETag for caching
    const eTag = `"cart-${userId}"`;

    return NextResponse.json(
      { success: true, cartItems },
      {
        headers: {
          ETag: eTag,
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/cart]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

// POST - add a new item to the cart
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { productId, medicineId, quantity = 1 } = await req.json();

    if (!productId && !medicineId) {
      return NextResponse.json(
        { success: false, error: 'Product ID or Medicine ID is required' },
        { status: 400 }
      );
    }

    if (productId && medicineId) {
      return NextResponse.json(
        { success: false, error: 'Cannot specify both product ID and medicine ID' },
        { status: 400 }
      );
    }

    // Handle medicine items
    if (medicineId) {
      try {
        // First check if the medicine exists without a transaction
        const medicineExists = await prisma.medicine.findUnique({
          where: { id: medicineId },
          select: { id: true },
        });

        if (!medicineExists) {
          return NextResponse.json(
            { success: false, error: 'Medicine not found' },
            { status: 404 }
          );
        }

        // Check if medicine is already in cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            userId,
            medicineId,
          },
        });

        let cartItem;
        if (existingCartItem) {
          // Update existing cart item
          cartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + quantity },
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  manufacturerName: true,
                  packSizeLabel: true,
                },
              },
            },
          });
        } else {
          // Create new cart item
          cartItem = await prisma.cartItem.create({
            data: {
              userId,
              medicineId,
              quantity,
            },
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  manufacturerName: true,
                  packSizeLabel: true,
                },
              },
            },
          });
        }

        return NextResponse.json(
          { success: true, message: 'Medicine added to cart', cartItem },
          { status: 201 }
        );
      } catch (error) {
        console.error('[POST /api/cart] Medicine error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to add medicine to cart' },
          { status: 500 }
        );
      }
    }

    // Handle product items
    if (productId) {
      try {
        // Check if the product exists without a transaction
        const productExists = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true },
        });

        if (!productExists) {
          return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Check if product is already in cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            userId,
            productId,
          },
        });

        let cartItem;
        if (existingCartItem) {
          // Update existing cart item
          cartItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + quantity },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          });
        } else {
          // Create new cart item
          cartItem = await prisma.cartItem.create({
            data: {
              userId,
              productId,
              quantity,
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          });
        }

        return NextResponse.json(
          { success: true, message: 'Item added to cart', cartItem },
          { status: 201 }
        );
      } catch (error) {
        console.error('[POST /api/cart] Product error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to add product to cart' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('[POST /api/cart] General error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
