import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';
import { quotes } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/auth';
import { eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';

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

    const { id } = req.query;
    const quoteId = parseInt(id as string);

    if (isNaN(quoteId)) {
      return res.status(400).json({ error: '无效的报价ID' });
    }

    // 获取报价详情
    const result = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: '报价不存在' });
    }

    const quote = result[0];

    // 创建Excel工作簿
    const workbook = XLSX.utils.book_new();

    // 准备报价数据
    const quoteData = [
      ['报价单信息', ''],
      ['报价单号', quote.quoteNumber],
      ['项目名称', quote.projectName || ''],
      ['客户名称', quote.customerName || ''],
      ['创建时间', quote.createdAt ? new Date(quote.createdAt).toLocaleString() : ''],
      ['状态', quote.status === 'draft' ? '草稿' : quote.status === 'confirmed' ? '已确认' : '已导出'],
      ['', ''],
      ['规格信息', ''],
      ['旧物料编号', quote.oldMaterialCode || ''],
      ['SAP物料', quote.sapMaterialCode || ''],
      ['物料描述', quote.materialDescription || ''],
      ['版本号', quote.versionNumber || ''],
      ['加工内容', quote.processingContent || ''],
      ['管板材质', quote.tubePlateMaterial || ''],
      ['价格年份', quote.priceYear || ''],
      ['', ''],
      ['尺寸信息', ''],
      ['厚度', quote.thickness || ''],
      ['长/直径', quote.lengthOrDiameter || ''],
      ['宽', quote.width || ''],
      ['', ''],
      ['加工信息', ''],
      ['钻孔孔径', quote.drillingHoleDiameter || ''],
      ['钻孔孔数', quote.drillingHoleCount?.toString() || ''],
      ['钻孔单价', quote.drillingUnitPrice || ''],
      ['螺纹类别', quote.threadCategory || ''],
      ['螺纹孔型号', quote.threadSpecification || ''],
      ['螺纹孔数', quote.threadHoleCount?.toString() || ''],
      ['类别三', quote.category3 || ''],
      ['攻螺纹单价', quote.threadingUnitPrice || ''],
      ['抠槽孔数', quote.groovingHoleCount?.toString() || ''],
      ['抠槽单价', quote.groovingUnitPrice || ''],
      ['', ''],
      ['价格计算', ''],
      ['钻孔费用', quote.drillingUnitPrice && quote.drillingHoleCount ? 
        `${quote.drillingUnitPrice} × ${quote.drillingHoleCount} = ${(parseFloat(quote.drillingUnitPrice) * quote.drillingHoleCount).toFixed(2)}` : ''],
      ['攻螺纹费用', quote.threadingUnitPrice && quote.threadHoleCount ? 
        `${quote.threadingUnitPrice} × ${quote.threadHoleCount} = ${(parseFloat(quote.threadingUnitPrice) * quote.threadHoleCount).toFixed(2)}` : ''],
      ['抠槽费用', quote.groovingUnitPrice && quote.groovingHoleCount ? 
        `${quote.groovingUnitPrice} × ${quote.groovingHoleCount} = ${(parseFloat(quote.groovingUnitPrice) * quote.groovingHoleCount).toFixed(2)}` : ''],
      ['总价', quote.totalPrice ? `¥${parseFloat(quote.totalPrice).toFixed(2)}` : ''],
      ['', ''],
      ['备注', quote.notes || ''],
    ];

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(quoteData);

    // 设置列宽
    worksheet['!cols'] = [
      { width: 20 }, // 标签列
      { width: 30 }, // 值列
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '报价单');

    // 生成Excel缓冲区
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="报价单_${quote.quoteNumber}.xlsx"`);

    // 发送Excel文件
    res.send(excelBuffer);

  } catch (error) {
    console.error('导出报价失败:', error);
    return res.status(500).json({ error: '导出报价失败' });
  }
}
