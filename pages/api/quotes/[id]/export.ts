import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';
import { quotes } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/auth';
import { eq } from 'drizzle-orm';

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

    // 获取当前日期
    const currentDate = new Date().toLocaleDateString('zh-CN');

    // 状态转换
    const getStatusText = (status: string) => {
      switch (status) {
        case 'draft': return '草稿';
        case 'confirmed': return '已确认';
        case 'exported': return '已导出';
        default: return status;
      }
    };

    // 计算价格
    const drillingSubtotal = (parseFloat(quote.drillingUnitPrice || '0')) * (quote.drillingHoleCount || 0);
    const threadingSubtotal = (parseFloat(quote.threadingUnitPrice || '0')) * (quote.threadHoleCount || 0);
    const groovingSubtotal = (parseFloat(quote.groovingUnitPrice || '0')) * (quote.groovingHoleCount || 0);
    const totalPrice = drillingSubtotal + threadingSubtotal + groovingSubtotal;

    // 创建CSV表头和数据
    const headers = [
      '报价单号',
      '项目名称', 
      '客户名称',
      '报价日期',
      '价格年份',
      '状态',
      '老物料编号',
      'SAP物料编号',
      '物料描述',
      '版本号',
      '管板材质',
      '加工内容',
      '厚度(mm)',
      '长/直径(mm)',
      '宽(mm)',
      '钻孔孔径(mm)',
      '钻孔孔数',
      '钻孔单价(元)',
      '钻孔小计(元)',
      '螺纹类别',
      '螺纹规格',
      '螺纹孔数',
      '螺纹单价(元)',
      '螺纹小计(元)',
      '抠槽孔数',
      '抠槽单价(元)',
      '抠槽小计(元)',
      '合计总价(元)',
      '备注',
      '创建时间',
      '生成时间'
    ];

    const values = [
      quote.quoteNumber || '',
      quote.projectName || '',
      quote.customerName || '',
      currentDate,
      quote.priceYear || '',
      getStatusText(quote.status || ''),
      quote.oldMaterialCode || '',
      quote.sapMaterialCode || '',
      quote.materialDescription || '',
      quote.versionNumber || '',
      quote.tubePlateMaterial || '',
      quote.processingContent || '',
      quote.thickness || '',
      quote.lengthOrDiameter || '',
      quote.width || '',
      quote.drillingHoleDiameter || '',
      quote.drillingHoleCount || '',
      quote.drillingUnitPrice || '',
      drillingSubtotal.toFixed(2),
      quote.threadCategory || '',
      quote.threadSpecification || '',
      quote.threadHoleCount || '',
      quote.threadingUnitPrice || '',
      threadingSubtotal.toFixed(2),
      quote.groovingHoleCount || '',
      quote.groovingUnitPrice || '',
      groovingSubtotal.toFixed(2),
      totalPrice.toFixed(2),
      quote.notes || '',
      quote.createdAt ? new Date(quote.createdAt).toLocaleString('zh-CN') : '',
      new Date().toLocaleString('zh-CN')
    ];

    // 转义CSV字段（处理包含逗号、引号或换行符的字段）
    const escapeCSVField = (field: string | number) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // 生成CSV内容
    const csvHeaders = headers.map(escapeCSVField).join(',');
    const csvValues = values.map(escapeCSVField).join(',');
    const csvContent = `${csvHeaders}\n${csvValues}`;

    // 添加BOM以确保Excel正确显示中文
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // 创建安全的文件名
    const fileName = `报价单_${quote.quoteNumber || 'unknown'}.csv`;
    const encodedFileName = encodeURIComponent(fileName);

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);

    // 发送CSV文件
    res.send(csvWithBOM);

  } catch (error) {
    console.error('导出报价失败:', error);
    return res.status(500).json({ error: '导出报价失败' });
  }
}
