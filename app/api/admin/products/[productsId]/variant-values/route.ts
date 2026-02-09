import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createVariantValueSchema } from '@/lib/schema/adminSchema';

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();

  const parsed = createVariantValueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { value, variantTypeId } = parsed.data;

  if (!value || !variantTypeId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const variantValue = await prisma.variantValue.create({
    data: {
      value,
      variantTypeId,
    },
  });

  return NextResponse.json(variantValue);
}
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const variantValues = await prisma.variantValue.findMany({
      include: {
        variantType: true,
      },
    });

    return NextResponse.json(variantValues);
  } catch (error: unknown) {
    let message = 'Unknown error';

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: 'Failed to fetch variant values', details: message },
      { status: 500 }
    );
  }
}
