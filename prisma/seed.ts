import { prisma } from '../lib/client.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Read the JSON file
  const jsonData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'indian_medicine_data.json'), 'utf-8')
  );

  console.log(`Found ${jsonData.length} medicines to import`);

  const batchSize = 100;
  for (let i = 0; i < jsonData.length; i += batchSize) {
    const batch = jsonData.slice(i, i + batchSize);

    const medicines = batch.map((medicine: any) => {
      const rawQuantity = medicine.qunatity ?? medicine.quantity;
      const quantity = Number.isFinite(rawQuantity)
        ? Number(rawQuantity)
        : Math.floor(Math.random() * 20 + 1); // 1–20

      return {
        name: medicine.name,
        price: parseFloat(medicine['price(₹)']) || 0,
        isDiscontinued: medicine.Is_discontinued?.toLowerCase() === 'true',
        manufacturerName: medicine.manufacturer_name,
        type: medicine.type,
        packSizeLabel: medicine.pack_size_label,
        composition1: medicine.short_composition1?.trim() || null,
        composition2: medicine.short_composition2?.trim() || null,
        quantity, // ✅ use cleaned/guaranteed quantity
      };
    });

    await prisma.medicine.createMany({
      data: medicines,
      skipDuplicates: true,
    });

    console.log(`Imported batch ${i / batchSize + 1} of ${Math.ceil(jsonData.length / batchSize)}`);
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch(e => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
