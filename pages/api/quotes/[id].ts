import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { quotes } from '../../../drizzle/schema';
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
    const quoteId = parseInt(id as string);

    if (isNaN(quoteId)) {
      return res.status(400).json({ error: '无效的报价ID' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, quoteId);
      case 'PUT':
        return await handlePut(req, res, quoteId);
      case 'DELETE':
        return await handleDelete(req, res, quoteId);
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
      .from(quotes)
      .where(eq(quotes.id, id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: '报价不存在' });
    }

    const quote = result[0];
    console.log('Raw quote from DB:', quote); // 调试：查看数据库原始数据
    
    // 确保decimal字段以字符串形式返回，避免精度损失
    const responseData = {
      ...quote,
      thickness: quote.thickness,
      lengthOrDiameter: quote.lengthOrDiameter,
      width: quote.width,
      drillingHoleDiameter: quote.drillingHoleDiameter,
      drillingUnitPrice: quote.drillingUnitPrice,
      threadSpecification: quote.threadSpecification,
      threadingUnitPrice: quote.threadingUnitPrice,
      groovingUnitPrice: quote.groovingUnitPrice,
      totalPrice: quote.totalPrice,
    };
    
    console.log('Response data:', responseData); // 调试：查看返回的数据
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('获取报价失败:', error);
    return res.status(500).json({ error: '获取报价失败' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: number) {
  const {
    quoteNumber,
    projectName,
    customerName,
    oldMaterialCode,
    sapMaterialCode,
    materialDescription,
    versionNumber,
    processingContent,
    tubePlateMaterial,
    priceYear,
    
    // 基本规格信息
    thickness,
    lengthOrDiameter,
    width,
    
    // 钻孔相关
    drillingHoleDiameter,
    drillingHoleCount,
    drillingUnitPrice,
    
    // 螺纹孔相关
    threadCategory,
    threadSpecification,
    threadHoleCount,
    category3,
    threadingUnitPrice,
    
    // 抠槽相关
    groovingHoleCount,
    groovingUnitPrice,
    
    notes,
    status
  } = req.body;

  try {
    // 计算总价
    const drilling = (parseFloat(drillingUnitPrice || '0')) * (parseInt(drillingHoleCount || '0'));
    const threading = (parseFloat(threadingUnitPrice || '0')) * (parseInt(threadHoleCount || '0'));
    const grooving = (parseFloat(groovingUnitPrice || '0')) * (parseInt(groovingHoleCount || '0'));
    const totalPrice = drilling + threading + grooving;

    const result = await db
      .update(quotes)
      .set({
        quoteNumber: quoteNumber || undefined,
        projectName: projectName || null,
        customerName: customerName || null,
        oldMaterialCode: oldMaterialCode || null,
        sapMaterialCode: sapMaterialCode || null,
        materialDescription: materialDescription || null,
        versionNumber: versionNumber || null,
        processingContent: processingContent || null,
        tubePlateMaterial: tubePlateMaterial || null,
        priceYear: priceYear || null,
        
        thickness: thickness ? parseInt(thickness) : null,
        lengthOrDiameter: lengthOrDiameter ? parseFloat(lengthOrDiameter).toString() : null,
        width: width ? parseFloat(width).toString() : null,
        
        drillingHoleDiameter: drillingHoleDiameter ? drillingHoleDiameter.toString() : null,
        drillingHoleCount: drillingHoleCount ? parseInt(drillingHoleCount) : null,
        drillingUnitPrice: drillingUnitPrice ? drillingUnitPrice.toString() : null,
        
        threadCategory: threadCategory || null,
        threadSpecification: threadSpecification ? threadSpecification.toString() : null,
        threadHoleCount: threadHoleCount ? parseInt(threadHoleCount) : null,
        category3: category3 || null,
        threadingUnitPrice: threadingUnitPrice ? threadingUnitPrice.toString() : null,
        
        groovingHoleCount: groovingHoleCount ? parseInt(groovingHoleCount) : null,
        groovingUnitPrice: groovingUnitPrice ? groovingUnitPrice.toString() : null,
        
        totalPrice: totalPrice.toString(),
        notes: notes || null,
        status: status || undefined,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: '报价不存在' });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('更新报价失败:', error);
    return res.status(500).json({ error: '更新报价失败' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const result = await db
      .delete(quotes)
      .where(eq(quotes.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: '报价不存在' });
    }

    return res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除报价失败:', error);
    return res.status(500).json({ error: '删除报价失败' });
  }
}
