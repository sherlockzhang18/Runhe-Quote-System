import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';
import { priceItems } from '../../drizzle/schema';
import { requireUser } from '../../lib/auth';
import { sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证用户身份
    const user = await requireUser(req);
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: '方法不允许' });
    }

    // 获取所有不重复的材质选项
    const materials = await db
      .selectDistinct({ material: priceItems.material })
      .from(priceItems)
      .where(sql`${priceItems.material} IS NOT NULL AND ${priceItems.material} != ''`)
      .orderBy(priceItems.material);

    // 提取材质值并过滤空值
    const materialOptions = materials
      .map(item => item.material)
      .filter(material => material && material.trim() !== '');

    return res.status(200).json({ materials: materialOptions });
  } catch (error) {
    console.error('获取材质选项失败:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
