const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkShop() {
  try {
    const shops = await prisma.shop.findMany({
      select: {
        shopDomain: true,
        status: true,
        createdAt: true,
      },
    });

    console.log('\n📊 Shops in database:');
    console.log('=====================');

    if (shops.length === 0) {
      console.log('❌ No shops found in database');
      console.log('\n💡 You need to install the app via OAuth:');
      console.log('   https://loyalty-quests-shopify-app-production.up.railway.app/api/auth?shop=teststorequest-3.myshopify.com');
    } else {
      shops.forEach((shop, index) => {
        console.log(`\n${index + 1}. ${shop.shopDomain}`);
        console.log(`   Status: ${shop.status}`);
        console.log(`   Created: ${shop.createdAt}`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkShop();
