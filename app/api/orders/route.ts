import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

// POST - Create a new order
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Please login to continue shopping' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const userId = payload.id;

    // 2. Parse request body - now with more flexible address handling
    const { address, totalAmount, paymentMethod = 'PENDING', items } = await req.json();

    if (!address || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Address and total amount are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      );
    }

    // 3. Handle address - validate addressId exists or create a new address
    let addressId = address.id;
    let validAddress = false;

    // Validate that the addressId exists if provided
    if (addressId) {
      const existingAddress = await prisma.userAddress.findUnique({
        where: { id: addressId },
      });

      if (existingAddress) {
        validAddress = true;
      } else {
        addressId = null; // Reset if invalid
      }
    }

    // If no valid addressId, create a new address
    if (!validAddress) {
      try {
        // Extract address data from the address object
        const { fullName, addressLine1, city, state, postalCode, phoneNumber } =
          typeof address === 'object' ? address : {};

        // Create a temporary address record
        const tempAddress = await prisma.userAddress.create({
          data: {
            userId,
            fullName: fullName || 'Delivery Address',
            phoneNumber: phoneNumber || payload.phoneNumber || 'Unknown',
            addressLine1:
              addressLine1 || (typeof address === 'string' ? address : 'Address Line 1'),
            addressLine2: address.addressLine2 || null,
            city: city || 'Unknown',
            state: state || 'Unknown',
            postalCode: postalCode || address.pincode || 'Unknown',
            country: 'India',
            isDefault: false,
          },
        });
        addressId = tempAddress.id;
        validAddress = true;
      } catch (addressError) {
        console.error('Failed to create address:', addressError);
        return NextResponse.json(
          { success: false, error: 'Failed to create delivery address' },
          { status: 400 }
        );
      }
    }

    // Validate addressId is now available
    if (!validAddress || !addressId) {
      return NextResponse.json(
        { success: false, error: 'Could not process address information' },
        { status: 400 }
      );
    }

    // Now proceed with order creation using the addressId
    const result = await prisma.$transaction(async tx => {
      // Create order first
      const order = await tx.order.create({
        data: {
          userId,
          addressId: addressId,
          status: 'PENDING',
          paymentMethod,
          totalAmount: parseFloat(totalAmount.toString()),
        },
        include: {
          orderItems: true,
        },
      });

      // Then create order items separately
      await tx.orderItem.createMany({
        data: items.map(
          (item: {
            productId?: string;
            medicineId?: string;
            combinationId?: string;
            quantity: number;
            price: number;
          }) => ({
            orderId: order.id,
            productId: item.productId || null,
            combinationId: item.combinationId || null,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            status: 'PENDING',
          })
        ),
      });

      // 4. Update stock for each product or variant
      for (const item of items) {
        if (item.combinationId) {
          // Update variant stock
          await tx.productVariantCombination.update({
            where: { id: item.combinationId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } else if (item.productId) {
          // Update base product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // 5. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });

    // 6. Respond with success
    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        orderId: result.id,
        order: result,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[POST /api/orders]', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// GET - Fetch orders
export async function GET(req: NextRequest) {
  try {
    // Authenticate user using the same token approach as in POST
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const userId = payload.id;

    // Fetch orders for the user using Prisma
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
