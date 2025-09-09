import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { db } from '../../../lib/db';
import { priceItems } from '../../../drizzle/schema';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

// 数据清理函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanNumericValue(value: any): string | null {
  if (!value || value === '') return null;
  
  let cleanValue = String(value).trim();
  
  // 移除特殊字符，如 Ø 符号
  cleanValue = cleanValue.replace(/[ØΦφ]/g, '');
  
  // 移除其他非数字字符，保留数字、小数点和负号
  cleanValue = cleanValue.replace(/[^\d.-]/g, '');
  
  // 验证是否为有效数字
  if (cleanValue === '' || isNaN(Number(cleanValue))) {
    return null;
  }
  
  return cleanValue;
}

// 清理整数值
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanIntegerValue(value: any): number | null {
  if (!value || value === '') return null;
  
  const cleanValue = cleanNumericValue(value);
  if (!cleanValue) return null;
  
  const intValue = parseInt(cleanValue);
  return isNaN(intValue) ? null : intValue;
}

// 清理字符串值
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanStringValue(value: any): string | null {
  if (!value || value === '') return null;
  return String(value).trim() || null;
}

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cb(new Error('只允许上传Excel文件') as any, false);
    }
  },
});

// 中间件包装器
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  // 简化的身份验证
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return res.status(401).json({ error: '未授权：请先登录' });
    }
    
    const cookies = parse(cookieHeader);
    const token = cookies.session;
    if (!token) {
      return res.status(401).json({ error: '未授权：没有会话' });
    }

    // 验证JWT token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: '未授权：登录已过期' });
  }

  try {
    // 处理文件上传
    await runMiddleware(req, res, upload.single('excel'));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: '请选择Excel文件' });
    }

    // 解析Excel文件
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON数据
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Excel数据预览:', jsonData.slice(0, 3)); // 打印前3行用于调试
    
    // 跳过表头，从第二行开始处理数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataRows = jsonData.slice(1) as any[][];
    
    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 批量处理数据
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      // 跳过空行
      if (!row || row.length === 0 || !row.some(cell => cell !== undefined && cell !== '')) {
        continue;
      }

      try {
        // 根据模板映射列数据，应用数据清理
        const rawData = {
          category1: cleanStringValue(row[0]), // 必填：钻孔/抠槽/螺纹盲孔/螺纹通孔
          category2: cleanStringValue(row[1]), // 可选：ABS/非ABS
          category3: cleanStringValue(row[2]), // 可选：尖底/平底
          material: cleanStringValue(row[3]),  // 可选：不锈钢/普通材质/09MnNiDⅢ
          thickness: cleanIntegerValue(row[4]), // 厚度 - 修改为整数
          minHoleDiameter: cleanNumericValue(row[5]), // 最小孔径
          maxHoleDiameter: cleanNumericValue(row[6]), // 最大孔径
          minHoles: cleanIntegerValue(row[7]), // 最小孔数
          maxHoles: cleanIntegerValue(row[8]),  // 最大孔数
          f25Price: cleanNumericValue(row[9]),  // F25单价
          f26Price: cleanNumericValue(row[10]), // F26单价
          f27Price: cleanNumericValue(row[11]), // F27单价
          f28Price: cleanNumericValue(row[12]), // F28单价
        };

        // 数据验证 - category1是必填的
        if (!rawData.category1) {
          importResults.errors.push(`第${i + 2}行：一级分类是必填字段`);
          importResults.failed++;
          continue;
        }

        // 验证一级分类的有效值
        const validCategory1 = ['钻孔', '抠槽', '螺纹盲孔', '螺纹通孔'];
        if (!validCategory1.includes(rawData.category1)) {
          importResults.errors.push(`第${i + 2}行：一级分类必须是：${validCategory1.join('、')}`);
          importResults.failed++;
          continue;
        }

        // 构建插入数据，确保category1非空
        const itemData = {
          category1: rawData.category1, // 已验证非空
          category2: rawData.category2,
          category3: rawData.category3,
          material: rawData.material,
          thickness: rawData.thickness,
          minHoleDiameter: rawData.minHoleDiameter,
          maxHoleDiameter: rawData.maxHoleDiameter,
          minHoles: rawData.minHoles,
          maxHoles: rawData.maxHoles,
          f25Price: rawData.f25Price,
          f26Price: rawData.f26Price,
          f27Price: rawData.f27Price,
          f28Price: rawData.f28Price,
        };

        console.log(`处理第${i + 2}行数据:`, itemData); // 调试信息

        // 插入数据库
        await db.insert(priceItems).values(itemData);
        importResults.success++;
        
      } catch (error) {
        console.error(`处理第${i + 2}行数据时出错:`, error);
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        importResults.errors.push(`第${i + 2}行：${errorMsg}`);
        importResults.failed++;
      }
    }

    res.status(200).json({
      message: '导入完成',
      results: importResults
    });

  } catch (error) {
    console.error('Excel导入错误:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : '导入失败'
    });
  }
}

// 禁用默认的body parser，因为我们使用multer
export const config = {
  api: {
    bodyParser: false,
  },
};
