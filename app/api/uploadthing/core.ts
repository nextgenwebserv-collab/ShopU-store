// this is default endpoint to add a image for product

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .input(z.object({ productId: z.string() }))
    .middleware(async ({ req, input }) => {
      const token = req.cookies.get('token')?.value;
      if (!token) throw new UploadThingError('Token not found');

      const payload = verifyToken(token);
      if (payload.role !== 'admin') {
        throw new UploadThingError('Unauthorized');
      }

      if (!input?.productId) {
        throw new UploadThingError('Product ID is required');
      }
      return { userId: payload.id, productId: input.productId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const image = await prisma.productImage.create({
        data: {
          url: file.ufsUrl,
          key: file.key,
          productId: metadata.productId,
        },
      });

      return {
        fileUrl: file.ufsUrl,
        imageId: image.id,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
