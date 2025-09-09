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

    // 生成HTML内容
    const htmlContent = generateQuoteHTML(quote);

    // 设置响应头
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);

  } catch (error) {
    console.error('生成打印页面失败:', error);
    return res.status(500).json({ error: '生成打印页面失败' });
  }
}

function generateQuoteHTML(quote: Record<string, unknown>): string {
  const currentDate = new Date().toLocaleDateString('zh-CN');
  
  // 安全的类型转换辅助函数
  const getString = (value: unknown): string => String(value || '');
  const getNumber = (value: unknown): number => Number(value) || 0;
  
  // 计算小计
  const drillingSubtotal = parseFloat(getString(quote.drillingUnitPrice)) * getNumber(quote.drillingHoleCount);
  const threadingSubtotal = parseFloat(getString(quote.threadingUnitPrice)) * getNumber(quote.threadHoleCount);
  const groovingSubtotal = parseFloat(getString(quote.groovingUnitPrice)) * getNumber(quote.groovingHoleCount);
  const totalPrice = drillingSubtotal + threadingSubtotal + groovingSubtotal;

  // 状态转换
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'confirmed': return '已确认';
      case 'exported': return '已导出';
      default: return status;
    }
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>报价单 - ${quote.quoteNumber}</title>
    <style>
        body {
            font-family: 'SimSun', serif;
            margin: 0;
            padding: 20px;
            background-color: #fff;
            line-height: 1.5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .quote-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .quote-subtitle {
            font-size: 18px;
            color: #666;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            width: 120px;
            flex-shrink: 0;
        }
        .info-value {
            flex: 1;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }
        .price-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .price-table th,
        .price-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .price-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .price-table .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .signature-item {
            text-align: center;
            flex: 1;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 30px;
            padding-top: 5px;
        }
        .notes {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body {
                padding: 0;
            }
            .container {
                border: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 头部 -->
        <div class="header">
            <div class="quote-title">管板加工报价单</div>
            <div class="quote-subtitle">QUOTE SHEET</div>
        </div>

        <!-- 基本信息 -->
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">报价单号:</div>
                <div class="info-value">${getString(quote.quoteNumber)}</div>
                <div class="info-label">报价日期:</div>
                <div class="info-value">${currentDate}</div>
            </div>
            <div class="info-row">
                <div class="info-label">项目名称:</div>
                <div class="info-value">${getString(quote.projectName)}</div>
                <div class="info-label">价格年份:</div>
                <div class="info-value">${getString(quote.priceYear)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">客户名称:</div>
                <div class="info-value">${getString(quote.customerName)}</div>
                <div class="info-label">状态:</div>
                <div class="info-value">${getStatusText(getString(quote.status))}</div>
            </div>
        </div>

        <!-- 产品规格信息 -->
        <div class="section-title">产品规格信息</div>
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">老物料编号:</div>
                <div class="info-value">${getString(quote.oldMaterialCode)}</div>
                <div class="info-label">SAP物料编号:</div>
                <div class="info-value">${getString(quote.sapMaterialCode)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">物料描述:</div>
                <div class="info-value">${getString(quote.materialDescription)}</div>
                <div class="info-label">版本号:</div>
                <div class="info-value">${getString(quote.versionNumber)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">管板材质:</div>
                <div class="info-value">${getString(quote.tubePlateMaterial)}</div>
                <div class="info-label">加工内容:</div>
                <div class="info-value">${getString(quote.processingContent)}</div>
            </div>
        </div>

        <!-- 尺寸信息 -->
        <div class="section-title">尺寸信息</div>
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">厚度 (mm):</div>
                <div class="info-value">${getString(quote.thickness)}</div>
                <div class="info-label">长/直径 (mm):</div>
                <div class="info-value">${getString(quote.lengthOrDiameter)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">宽 (mm):</div>
                <div class="info-value">${getString(quote.width)}</div>
            </div>
        </div>

        <!-- 价格明细 -->
        <div class="section-title">价格明细</div>
        <table class="price-table">
            <thead>
                <tr>
                    <th>加工类型</th>
                    <th>规格</th>
                    <th>孔数</th>
                    <th>单价 (元)</th>
                    <th>小计 (元)</th>
                </tr>
            </thead>
            <tbody>
                ${getNumber(quote.drillingHoleCount) > 0 ? `
                <tr>
                    <td>钻孔</td>
                    <td>φ${getString(quote.drillingHoleDiameter)}mm</td>
                    <td>${getNumber(quote.drillingHoleCount)}</td>
                    <td>${parseFloat(getString(quote.drillingUnitPrice)).toFixed(2)}</td>
                    <td>${drillingSubtotal.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${getNumber(quote.threadHoleCount) > 0 ? `
                <tr>
                    <td>${getString(quote.threadCategory) || '攻螺纹'}</td>
                    <td>${getString(quote.threadSpecification)}</td>
                    <td>${getNumber(quote.threadHoleCount)}</td>
                    <td>${parseFloat(getString(quote.threadingUnitPrice)).toFixed(2)}</td>
                    <td>${threadingSubtotal.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${getNumber(quote.groovingHoleCount) > 0 ? `
                <tr>
                    <td>抠槽</td>
                    <td>-</td>
                    <td>${getNumber(quote.groovingHoleCount)}</td>
                    <td>${parseFloat(getString(quote.groovingUnitPrice)).toFixed(2)}</td>
                    <td>${groovingSubtotal.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td colspan="4">合计总价:</td>
                    <td>¥${totalPrice.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        ${getString(quote.notes) ? `
        <!-- 备注 -->
        <div class="notes">
            <strong>备注:</strong><br>
            ${getString(quote.notes)}
        </div>
        ` : ''}

        <!-- 签名区域 -->
        <div class="signature-section">
            <div class="signature-item">
                <div>制表人:</div>
                <div class="signature-line">签名:</div>
            </div>
            <div class="signature-item">
                <div>审核人:</div>
                <div class="signature-line">签名:</div>
            </div>
            <div class="signature-item">
                <div>客户确认:</div>
                <div class="signature-line">签名:</div>
            </div>
        </div>

        <!-- 页脚 -->
        <div class="footer">
            生成时间: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>

    <script>
        // 页面加载完成后自动打印
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`;
}
