import 'dotenv/config';
import { db } from '../lib/db';
import { priceItems } from '../drizzle/schema';

async function createTestPriceItems() {
  try {
    console.log('正在添加测试价格数据...');

    const testData = [
      {
        category1: '机械零件',
        category2: '螺栓',
        category3: '六角螺栓',
        material: '304不锈钢',
        thickness: '5.00',
        minHoleDistance: '10.00',
        maxHoleDistance: '20.00',
        minHoles: 2,
        maxHoles: 8,
        f25Price: '0.1200',
        f26Price: '0.1350',
        f27Price: '0.1500',
        f28Price: '0.1650',
        threadingPrice: '0.0500',
        groovingPrice: '0.0300'
      },
      {
        category1: '紧固件',
        category2: '螺母',
        category3: '六角螺母',
        material: '碳钢',
        thickness: '3.00',
        minHoleDistance: '8.00',
        maxHoleDistance: '15.00',
        minHoles: 1,
        maxHoles: 6,
        f25Price: '0.0800',
        f26Price: '0.0900',
        f27Price: '0.1000',
        f28Price: '0.1100',
        threadingPrice: '0.0400',
        groovingPrice: '0.0200'
      },
      {
        category1: '标准件',
        category2: '垫圈',
        category3: '平垫圈',
        material: '镀锌钢',
        thickness: '2.00',
        minHoleDistance: '5.00',
        maxHoleDistance: '12.00',
        minHoles: 1,
        maxHoles: 4,
        f25Price: '0.0500',
        f26Price: '0.0600',
        f27Price: '0.0700',
        f28Price: '0.0800',
        threadingPrice: '0.0200',
        groovingPrice: '0.0100'
      },
      {
        category1: '机械零件',
        category2: '轴承',
        category3: '深沟球轴承',
        material: '轴承钢',
        thickness: '10.00',
        minHoleDistance: '25.00',
        maxHoleDistance: '50.00',
        minHoles: 6,
        maxHoles: 12,
        f25Price: '2.5000',
        f26Price: '2.8000',
        f27Price: '3.1000',
        f28Price: '3.4000',
        threadingPrice: '0.5000',
        groovingPrice: '0.3000'
      },
      {
        category1: '紧固件',
        category2: '螺钉',
        category3: '内六角螺钉',
        material: '合金钢',
        thickness: '8.00',
        minHoleDistance: '12.00',
        maxHoleDistance: '25.00',
        minHoles: 3,
        maxHoles: 10,
        f25Price: '0.2500',
        f26Price: '0.2800',
        f27Price: '0.3100',
        f28Price: '0.3400',
        threadingPrice: '0.0800',
        groovingPrice: '0.0500'
      }
    ];

    for (const item of testData) {
      await db.insert(priceItems).values(item);
      console.log(`已添加: ${item.category1} - ${item.category2} - ${item.material}`);
    }

    console.log('✅ 测试数据添加完成！');
    console.log(`总共添加了 ${testData.length} 条价格数据`);

  } catch (error) {
    console.error('❌ 添加测试数据失败:', error);
  }
}

// 运行脚本
createTestPriceItems().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
