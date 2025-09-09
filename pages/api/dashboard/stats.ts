import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { priceItems, quotes } from '../../../drizzle/schema';
import { requireUser } from '../../../lib/auth';
import { count } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 验证用户身份
    const user = await requireUser(req);
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }

    // 获取单价记录总数
    const priceItemsCount = await db
      .select({ count: count() })
      .from(priceItems);

    // 获取报价单总数
    const quotesCount = await db
      .select({ count: count() })
      .from(quotes);

    // 获取今日报价数（创建时间为今天的报价单）
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // 获取所有报价，然后在JavaScript中过滤今天的
    const allQuotes = await db
      .select({ createdAt: quotes.createdAt })
      .from(quotes);

    const todayQuotesCount = allQuotes.filter(quote => {
      if (!quote.createdAt) return false;
      const quoteDate = new Date(quote.createdAt);
      return quoteDate >= startOfDay && quoteDate < endOfDay;
    }).length;

    // 系统状态检查（简单检查数据库连接是否正常）
    const systemStatus = 'normal'; // 如果到这里没有抛出错误，说明数据库连接正常

    const stats = {
      priceItemsCount: priceItemsCount[0]?.count || 0,
      quotesCount: quotesCount[0]?.count || 0,
      todayQuotesCount: todayQuotesCount,
      systemStatus: systemStatus
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('获取统计数据失败:', error);
    return res.status(500).json({ error: '获取统计数据失败' });
  }
}
