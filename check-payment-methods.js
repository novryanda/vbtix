import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPaymentMethods() {
  try {
    console.log('Checking payment methods in database...');
    
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('Found payment methods:', paymentMethods.length);
    paymentMethods.forEach(pm => {
      console.log(`- ID: ${pm.id}, Code: ${pm.code}, Name: ${pm.name}, Active: ${pm.isActive}`);
    });
    
    if (paymentMethods.length === 0) {
      console.log('No payment methods found. Inserting default ones...');
      
      await prisma.paymentMethod.createMany({
        data: [
          {
            id: 'pm_manual_payment',
            code: 'MANUAL_PAYMENT',
            name: 'Pembayaran Manual',
            description: 'Pembayaran akan dikonfirmasi manual oleh admin',
            isActive: true
          },
          {
            id: 'pm_qris_by_wonders',
            code: 'QRIS_BY_WONDERS',
            name: 'Wondr by BNI',
            description: 'Scan QR code untuk pembayaran dengan QRIS',
            isActive: true
          }
        ],
        skipDuplicates: true
      });
      
      console.log('Default payment methods inserted.');
    }
    
  } catch (error) {
    console.error('Error checking payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentMethods();
