import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { priceItems } from '../../../drizzle/schema';
import { requireUser } from '../../../lib/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证用户身份
    const user = await requireUser(req);
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    const { id } = req.query;
    const itemId = parseInt(id as string);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: '无效的ID' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, itemId);
      case 'PUT':
        return await handlePut(req, res, itemId);
      case 'DELETE':
        return await handleDelete(req, res, itemId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const result = await db
      .select()
      .from(priceItems)
      .where(eq(priceItems.id, id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: '价格项不存在' });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('获取价格项失败:', error);
    return res.status(500).json({ error: '获取价格项失败' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: number) {
  const {
    category1,
    category2,
    category3,
    material,
    thickness,
    minHoleDistance,
    maxHoleDistance,
    minHoles,
    maxHoles,
    f25Price,
    f26Price,
    f27Price,
    f28Price,
    threadingPrice,
    groovingPrice
  } = req.body;

  // 验证必填字段
  if (!category1 || !material) {
    return res.status(400).json({ error: '缺少必填字段：一级分类和材料' });
  }

  try {
    const result = await db
      .update(priceItems)
      .set({
        category1,
        category2: category2 || null,
        category3: category3 || null,
        material,
        thickness: thickness ? thickness.toString() : null,
        minHoleDistance: minHoleDistance ? minHoleDistance.toString() : null,
        maxHoleDistance: maxHoleDistance ? maxHoleDistance.toString() : null,
        minHoles: minHoles ? parseInt(minHoles) : null,
        maxHoles: maxHoles ? parseInt(maxHoles) : null,
        f25Price: f25Price ? f25Price.toString() : null,
        f26Price: f26Price ? f26Price.toString() : null,
        f27Price: f27Price ? f27Price.toString() : null,
        f28Price: f28Price ? f28Price.toString() : null,
        threadingPrice: threadingPrice ? threadingPrice.toString() : null,
        groovingPrice: groovingPrice ? groovingPrice.toString() : null,
        updatedAt: new Date(),
      })
      .where(eq(priceItems.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: '价格项不存在' });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('更新价格项失败:', error);
    return res.status(500).json({ error: '更新价格项失败' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const result = await db
      .delete(priceItems)
      .where(eq(priceItems.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: '价格项不存在' });
    }

    return res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除价格项失败:', error);
    return res.status(500).json({ error: '删除价格项失败' });
  }
}
