import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 验证用户身份
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // 创建Excel模板数据
    const templateData = [
      [
        '一级分类',
        '二级分类', 
        '三级分类',
        '材质',
        '厚度',
        '最小孔径',
        '最大孔径',
        '最小孔数',
        '最大孔数',
        'F25价格',
        'F26价格',
        'F27价格',
        'F28价格'
      ],
      [
        '钻孔',
        'ABS',
        '尖底',
        '不锈钢',
        '5.0',
        '9.7',
        '15.0',
        '4',
        '20',
        '2.50',
        '3.00',
        '3.50',
        '4.00'
      ],
      [
        '抠槽',
        '非ABS',
        '平底',
        '普通材质',
        '8.0',
        '12.0',
        '25.0',
        '6',
        '50',
        '1.80',
        '2.20',
        '2.80',
        '3.20'
      ],
      [
        '螺纹盲孔',
        'ABS',
        '尖底',
        '09MnNiDⅢ',
        '10.0',
        '16.0',
        '30.0',
        '8',
        '100',
        '3.20',
        '3.80',
        '4.50',
        '5.20'
      ]
    ];

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 12 }, // 一级分类
      { wch: 12 }, // 二级分类
      { wch: 12 }, // 三级分类
      { wch: 15 }, // 材质
      { wch: 8 },  // 厚度
      { wch: 10 }, // 最小孔径
      { wch: 10 }, // 最大孔径
      { wch: 10 }, // 最小孔数
      { wch: 10 }, // 最大孔数
      { wch: 10 }, // F25价格
      { wch: 10 }, // F26价格
      { wch: 10 }, // F27价格
      { wch: 10 }  // F28价格
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '价格模板');

    // 生成Excel文件buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=price_template.xlsx');
    res.setHeader('Content-Length', excelBuffer.length);

    // 发送文件
    res.send(excelBuffer);

  } catch (error) {
    console.error('生成模板错误:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : '生成模板失败'
    });
  }
}
