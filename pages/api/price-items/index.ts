import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { priceItems } from '../../../drizzle/schema';
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
  const { page = '1', limit = '50' } = req.query;
  
  try {
    // 构建基础查询
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // 简单的全量查询，然后在应用层过滤
    const result = await db
      .select()
      .from(priceItems)
      .orderBy(desc(priceItems.updatedAt))
      .limit(limitNum)
      .offset(offset);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('获取价格项失败:', error);
    return res.status(500).json({ error: '获取价格项失败' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    category1,
    category2,
    category3,
    material,
    thickness,
    minHoleDiameter,
    maxHoleDiameter,
    minHoles,
    maxHoles,
    f25Price,
    f26Price,
    f27Price,
    f28Price
  } = req.body;

  // 验证必填字段
  if (!category1) {
    return res.status(400).json({ error: '缺少必填字段：一级分类' });
  }

  try {
    const result = await db.insert(priceItems).values({
      category1,
      category2: category2 || null,
      category3: category3 || null,
      material: material || null,
      thickness: thickness ? thickness.toString() : null,
      minHoleDiameter: minHoleDiameter ? minHoleDiameter.toString() : null,
      maxHoleDiameter: maxHoleDiameter ? maxHoleDiameter.toString() : null,
      minHoles: minHoles ? parseInt(minHoles) : null,
      maxHoles: maxHoles ? parseInt(maxHoles) : null,
      f25Price: f25Price ? f25Price.toString() : null,
      f26Price: f26Price ? f26Price.toString() : null,
      f27Price: f27Price ? f27Price.toString() : null,
      f28Price: f28Price ? f28Price.toString() : null,
    }).returning();

    return res.status(201).json(result[0]);
  } catch (error) {
    console.error('创建价格项失败:', error);
    return res.status(500).json({ error: '创建价格项失败' });
  }
}
