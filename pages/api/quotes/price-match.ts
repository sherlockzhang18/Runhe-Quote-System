import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { priceItems } from '../../../drizzle/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { requireUser } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // 验证用户身份
    const user = await requireUser(req);
    if (!user) {
      return res.status(401).json({ error: '未授权访问' });
    }
  } catch {
    return res.status(401).json({ error: '未授权访问' });
  }

  try {
    // 从请求体中获取所有参数
    const {
      // 钻孔参数
      drillingCategory,
      drillingMaterial, // 管板材质
      drillingThickness,
      drillingDiameter,
      drillingHoleCount,
      // 螺纹参数
      threadingCategory, // 螺纹类别 (螺纹盲孔/螺纹通孔)
      threadingMaterial, // 管板材质
      threadingSpecification, // 螺纹型号 (如M20)
      threadingHoleCount,
      // 抠槽参数
      groovingCategory,
      groovingMaterial, // 管板材质
      groovingHoleCount,
      // 年份
      priceYear = 'F28',
      // 物料描述 (用于钻孔和抠槽匹配)
      materialDescription
    } = req.body;

    console.log('Price match request:', {
      drillingCategory, drillingMaterial, drillingThickness, drillingDiameter, drillingHoleCount,
      threadingCategory, threadingMaterial, threadingSpecification, threadingHoleCount,
      groovingCategory, groovingMaterial, groovingHoleCount,
      priceYear, materialDescription
    });

    // 转换价格年份格式 (F28 -> f28)
    const normalizedPriceYear = priceYear.toLowerCase();

    const result: {
      drillingPrice?: string | null;
      threadingPrice?: string | null;
      groovingPrice?: string | null;
    } = {};

    // 1. 钻孔价格匹配
    // 条件：物料描述(category2) + 管板材质 + 厚度 + 孔径范围 + 孔数范围
    if (drillingCategory && drillingCategory === '钻孔') {
      const drillingConditions = [eq(priceItems.category1, '钻孔')];
      
      // 物料描述匹配 (使用category2字段)
      if (materialDescription) {
        drillingConditions.push(eq(priceItems.category2, materialDescription));
      }
      
      // 管板材质匹配
      if (drillingMaterial) {
        drillingConditions.push(eq(priceItems.material, drillingMaterial));
      }
      
      // 厚度匹配
      if (drillingThickness) {
        drillingConditions.push(eq(priceItems.thickness, parseInt(drillingThickness)));
      }
      
      // 孔径范围匹配
      if (drillingDiameter) {
        const diameter = parseFloat(drillingDiameter);
        drillingConditions.push(
          and(
            lte(priceItems.minHoleDiameter, diameter.toString()),
            gte(priceItems.maxHoleDiameter, diameter.toString())
          )!
        );
      }
      
      // 孔数范围匹配
      if (drillingHoleCount) {
        drillingConditions.push(
          and(
            lte(priceItems.minHoles, parseInt(drillingHoleCount)),
            gte(priceItems.maxHoles, parseInt(drillingHoleCount))
          )!
        );
      }

      const drillingMatches = await db
        .select()
        .from(priceItems)
        .where(and(...drillingConditions));

      console.log('Drilling conditions count:', drillingConditions.length);
      console.log('Drilling matches found:', drillingMatches.length);
      if (drillingMatches.length > 0) {
        const match = drillingMatches[0];
        const priceField = `${normalizedPriceYear}Price` as keyof typeof match;
        const price = match[priceField];
        console.log('Drilling match:', { 
          category1: match.category1,
          category2: match.category2,
          material: match.material, 
          thickness: match.thickness,
          minDiameter: match.minHoleDiameter,
          maxDiameter: match.maxHoleDiameter,
          minHoles: match.minHoles,
          maxHoles: match.maxHoles,
          priceField, 
          price 
        });
        result.drillingPrice = price ? String(price) : null;
      }
    }

    // 2. 螺纹价格匹配
    // 条件：类别1(螺纹类别) + 螺纹型号(孔径范围) + 厚度匹配 + 仅ABS时的管板材质匹配
    // 注意：孔数不参与筛选条件，只用于计算小计
    if (threadingCategory) {
      const threadingConditions = [eq(priceItems.category1, threadingCategory)]; // 螺纹盲孔 或 螺纹通孔
      
      // 螺纹型号对应孔径范围匹配
      if (threadingSpecification) {
        // 从螺纹规格中提取数字部分 (如 M20 -> "20")
        const specMatch = threadingSpecification.toString().match(/\d+/);
        if (specMatch) {
          const specNumber = specMatch[0];
          threadingConditions.push(
            and(
              lte(priceItems.minHoleDiameter, specNumber),
              gte(priceItems.maxHoleDiameter, specNumber)
            )!
          );
        }
      }
      
      // 厚度匹配 (使用钻孔的厚度参数)
      if (drillingThickness) {
        threadingConditions.push(eq(priceItems.thickness, parseInt(drillingThickness)));
      }
      
      // 管板材质与类别2对应关系：只有ABS时才计入筛选条件
      if (threadingMaterial && threadingMaterial === 'ABS') {
        threadingConditions.push(eq(priceItems.category2, 'ABS'));
      } else if (threadingMaterial && threadingMaterial !== 'ABS') {
        // 非ABS时，不把管板材质计入筛选条件，只匹配category2为'非ABS'的记录
        threadingConditions.push(eq(priceItems.category2, '非ABS'));
      }
      
      // 注意：孔数不参与筛选条件，移除孔数范围匹配

      const threadingMatches = await db
        .select()
        .from(priceItems)
        .where(and(...threadingConditions));

      console.log('Threading conditions count:', threadingConditions.length);
      console.log('Threading matches found:', threadingMatches.length);
      if (threadingMatches.length > 0) {
        const match = threadingMatches[0];
        const priceField = `${normalizedPriceYear}Price` as keyof typeof match;
        const price = match[priceField];
        console.log('Threading match:', { 
          category1: match.category1,
          category2: match.category2,
          minDiameter: match.minHoleDiameter,
          maxDiameter: match.maxHoleDiameter,
          minHoles: match.minHoles,
          maxHoles: match.maxHoles,
          priceField, 
          price 
        });
        result.threadingPrice = price ? String(price) : null;
      }
    }

    // 3. 抠槽价格匹配
    // 条件：类别1(抠槽) + 物料描述(category2) + 类别2匹配管板材质 + 孔数范围
    if (groovingCategory && groovingCategory === '抠槽') {
      const groovingConditions = [eq(priceItems.category1, '抠槽')];
      
      // 物料描述匹配 (使用category2字段)
      if (materialDescription) {
        groovingConditions.push(eq(priceItems.category2, materialDescription));
      }
      
      // 如果没有单独的物料描述，则根据管板材质确定类别2
      if (!materialDescription && groovingMaterial) {
        let category2Value = '';
        if (groovingMaterial === 'ABS') {
          category2Value = 'ABS';
        } else {
          category2Value = '非ABS'; // 碳钢、不锈钢等都属于非ABS
        }
        groovingConditions.push(eq(priceItems.category2, category2Value));
      }
      
      // 孔数范围匹配
      if (groovingHoleCount) {
        groovingConditions.push(
          and(
            lte(priceItems.minHoles, parseInt(groovingHoleCount)),
            gte(priceItems.maxHoles, parseInt(groovingHoleCount))
          )!
        );
      }

      const groovingMatches = await db
        .select()
        .from(priceItems)
        .where(and(...groovingConditions));

      console.log('Grooving conditions count:', groovingConditions.length);
      console.log('Grooving matches found:', groovingMatches.length);
      if (groovingMatches.length > 0) {
        const match = groovingMatches[0];
        const priceField = `${normalizedPriceYear}Price` as keyof typeof match;
        const price = match[priceField];
        console.log('Grooving match:', { 
          category1: match.category1,
          category2: match.category2,
          minHoles: match.minHoles,
          maxHoles: match.maxHoles,
          priceField, 
          price 
        });
        result.groovingPrice = price ? String(price) : null;
      }
    }

    console.log('Final result:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('价格匹配失败:', error);
    return res.status(500).json({ error: '价格匹配失败' });
  }
}
