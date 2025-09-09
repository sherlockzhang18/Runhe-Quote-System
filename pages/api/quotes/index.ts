import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { quotes } from '../../../drizzle/schema';
import { requireUser } from '../../../lib/auth';
import { desc } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证用户身份
    const user = await requireUser(req);
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '20' } = req.query;
  
  try {
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 执行查询获取报价列表
    const quotesResult = await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.updatedAt))
      .limit(limitNum)
      .offset(offset);

    // 获取总数（简化处理）
    const totalResult = await db.select().from(quotes);
    const total = totalResult.length;
    
    return res.status(200).json({
      quotes: quotesResult,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('获取报价列表失败:', error);
    return res.status(500).json({ error: '获取报价列表失败' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    quoteNumber,
    // 规格信息
    oldMaterialCode,
    sapMaterialCode,
    materialDescription,
    versionNumber,
    processingContent,
    tubePlateMaterial,
    priceYear,
    // 基本尺寸
    thickness,
    lengthOrDiameter,
    width,
    // 钻孔信息
    drillingHoleDiameter,
    drillingHoleCount,
    drillingUnitPrice,
    // 攻螺纹信息
    threadCategory,
    threadSpecification,
    threadHoleCount,
    category3,
    threadingUnitPrice,
    // 抠槽信息
    groovingHoleCount,
    groovingUnitPrice,
    // 其他
    projectName,
    customerName,
    notes
  } = req.body;

  // 验证必填字段
  if (!quoteNumber) {
    return res.status(400).json({ error: '缺少必填字段：报价单号' });
  }

  // 计算总价
  const drillingTotal = (parseFloat(drillingUnitPrice || '0') * parseInt(drillingHoleCount || '0'));
  const threadingTotal = (parseFloat(threadingUnitPrice || '0') * parseInt(threadHoleCount || '0'));
  const groovingTotal = (parseFloat(groovingUnitPrice || '0') * parseInt(groovingHoleCount || '0'));
  const totalPrice = drillingTotal + threadingTotal + groovingTotal;

  try {
    const result = await db.insert(quotes).values({
      quoteNumber,
      // 规格信息
      oldMaterialCode: oldMaterialCode || null,
      sapMaterialCode: sapMaterialCode || null,
      materialDescription: materialDescription || null,
      versionNumber: versionNumber || null,
      processingContent: processingContent || null,
      tubePlateMaterial: tubePlateMaterial || null,
      priceYear: priceYear || null,
      // 基本尺寸
      thickness: thickness ? parseInt(thickness) : null,
      lengthOrDiameter: lengthOrDiameter ? lengthOrDiameter.toString() : null,
      width: width ? width.toString() : null,
      // 钻孔信息
      drillingHoleDiameter: drillingHoleDiameter ? drillingHoleDiameter.toString() : null,
      drillingHoleCount: drillingHoleCount ? parseInt(drillingHoleCount) : null,
      drillingUnitPrice: drillingUnitPrice ? drillingUnitPrice.toString() : null,
      // 攻螺纹信息
      threadCategory: threadCategory || null,
      threadSpecification: threadSpecification ? threadSpecification.toString() : null,
      threadHoleCount: threadHoleCount ? parseInt(threadHoleCount) : null,
      category3: category3 || null,
      threadingUnitPrice: threadingUnitPrice ? threadingUnitPrice.toString() : null,
      // 抠槽信息
      groovingHoleCount: groovingHoleCount ? parseInt(groovingHoleCount) : null,
      groovingUnitPrice: groovingUnitPrice ? groovingUnitPrice.toString() : null,
      // 计算结果
      totalPrice: totalPrice.toString(),
      // 其他
      projectName: projectName || null,
      customerName: customerName || null,
      notes: notes || null,
      createdBy: 1, // 临时使用固定用户ID
    }).returning();

    return res.status(201).json(result[0]);
  } catch (error) {
    console.error('创建报价失败:', error);
    return res.status(500).json({ error: '创建报价失败' });
  }
}
