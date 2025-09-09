import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import {
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';

export interface QuoteFormData {
  quoteNumber: string;
  // 规格信息
  oldMaterialCode: string;
  sapMaterialCode: string;
  materialDescription: string;
  versionNumber: string;
  processingContent: string;
  tubePlateMaterial: string;
  priceYear: string;
  // 基本尺寸
  thickness: string;
  lengthOrDiameter: string;
  width: string;
  // 钻孔信息
  drillingHoleDiameter: string;
  drillingHoleCount: string;
  drillingUnitPrice: string;
  // 攻螺纹信息
  threadCategory: string;
  threadSpecification: string;
  threadHoleCount: string;
  category3: string;
  threadingUnitPrice: string;
  // 抠槽信息
  groovingHoleCount: string;
  groovingUnitPrice: string;
  // 其他
  projectName: string;
  customerName: string;
  notes: string;
}

interface QuoteFormProps {
  formData: QuoteFormData;
  onChange: (data: QuoteFormData) => void;
  onAutoPrice?: () => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
  alert?: {type: 'success' | 'error', message: string} | null;
}

export default function QuoteForm({ 
  formData, 
  onChange, 
  onAutoPrice, 
  loading = false, 
  mode = 'create',
  alert 
}: QuoteFormProps) {
  
  const [materialOptions, setMaterialOptions] = useState<string[]>([]);

  // 获取材质选项
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/materials');
        if (response.ok) {
          const data = await response.json();
          setMaterialOptions(data.materials || []);
        }
      } catch (error) {
        console.error('获取材质选项失败:', error);
      }
    };

    fetchMaterials();
  }, []);
  
  // 计算总价
  const calculateTotalPrice = () => {
    const drilling = parseFloat(formData.drillingUnitPrice || '0') * parseInt(formData.drillingHoleCount || '0');
    const threading = parseFloat(formData.threadingUnitPrice || '0') * parseInt(formData.threadHoleCount || '0');
    const grooving = parseFloat(formData.groovingUnitPrice || '0') * parseInt(formData.groovingHoleCount || '0');
    return drilling + threading + grooving;
  };

  // 更新表单字段
  const updateField = (field: keyof QuoteFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    onChange(newData);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 提示信息 */}
      {alert && (
        <Alert severity={alert.type}>
          {alert.message}
        </Alert>
      )}

      {/* 基本信息 */}
      {mode === 'create' && (
        <Card>
          <CardHeader title="基本信息" />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="报价单号"
                value={formData.quoteNumber}
                onChange={(e) => updateField('quoteNumber', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="项目名称"
                value={formData.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                fullWidth
              />
              <TextField
                label="客户名称"
                value={formData.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {mode === 'edit' && (
        <Card>
          <CardHeader title="基本信息" />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="项目名称"
                value={formData.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                fullWidth
              />
              <TextField
                label="客户名称"
                value={formData.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 规格信息 */}
      <Card>
        <CardHeader title="规格信息" />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="旧物料编号"
                value={formData.oldMaterialCode}
                onChange={(e) => updateField('oldMaterialCode', e.target.value)}
                fullWidth
              />
              <TextField
                label="SAP物料编号"
                value={formData.sapMaterialCode}
                onChange={(e) => updateField('sapMaterialCode', e.target.value)}
                fullWidth
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>物料描述</InputLabel>
              <Select
                value={formData.materialDescription}
                onChange={(e) => updateField('materialDescription', e.target.value)}
              >
                <MenuItem value="">请选择</MenuItem>
                <MenuItem value="ABS">ABS</MenuItem>
                <MenuItem value="非ABS">非ABS</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="版本号"
                value={formData.versionNumber}
                onChange={(e) => updateField('versionNumber', e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>管板材质</InputLabel>
                <Select
                  value={formData.tubePlateMaterial}
                  onChange={(e) => updateField('tubePlateMaterial', e.target.value)}
                >
                  <MenuItem value="">请选择</MenuItem>
                  {materialOptions.map((material) => (
                    <MenuItem key={material} value={material}>
                      {material}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>价格年份</InputLabel>
                <Select
                  value={formData.priceYear}
                  onChange={(e) => updateField('priceYear', e.target.value)}
                >
                  <MenuItem value="F25">F25</MenuItem>
                  <MenuItem value="F26">F26</MenuItem>
                  <MenuItem value="F27">F27</MenuItem>
                  <MenuItem value="F28">F28</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 尺寸信息 */}
      <Card>
        <CardHeader title="尺寸信息" />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="厚度 (mm)"
              type="number"
              value={formData.thickness}
              onChange={(e) => updateField('thickness', e.target.value)}
              fullWidth
            />
            <TextField
              label="长/直径 (mm)"
              type="number"
              value={formData.lengthOrDiameter}
              onChange={(e) => updateField('lengthOrDiameter', e.target.value)}
              fullWidth
            />
            <TextField
              label="宽 (mm)"
              type="number"
              value={formData.width}
              onChange={(e) => updateField('width', e.target.value)}
              fullWidth
            />
          </Box>
        </CardContent>
      </Card>

      {/* 加工信息和价格 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">加工信息和价格</Typography>
            {onAutoPrice && (
              <Button
                variant="contained"
                startIcon={<AutoIcon />}
                onClick={onAutoPrice}
                disabled={loading}
                color="secondary"
              >
                {loading ? '获取中...' : '🚀 自动获取价格'}
              </Button>
            )}
          </Box>

          {/* 钻孔 */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>钻孔加工</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="孔径 (mm)"
              type="number"
              value={formData.drillingHoleDiameter}
              onChange={(e) => updateField('drillingHoleDiameter', e.target.value)}
            />
            <TextField
              label="孔数"
              type="number"
              value={formData.drillingHoleCount}
              onChange={(e) => updateField('drillingHoleCount', e.target.value)}
            />
            <TextField
              label="钻孔单价 (元)"
              type="number"
              value={formData.drillingUnitPrice}
              onChange={(e) => updateField('drillingUnitPrice', e.target.value)}
              inputProps={{ step: 0.01 }}
            />
            <TextField
              label="钻孔小计 (元)"
              value={(parseFloat(formData.drillingUnitPrice || '0') * parseInt(formData.drillingHoleCount || '0')).toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 攻螺纹 */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>攻螺纹加工</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>螺纹类别</InputLabel>
              <Select
                value={formData.threadCategory}
                onChange={(e) => updateField('threadCategory', e.target.value)}
              >
                <MenuItem value="">请选择</MenuItem>
                <MenuItem value="螺纹盲孔">螺纹盲孔</MenuItem>
                <MenuItem value="螺纹通孔">螺纹通孔</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="螺纹规格"
              value={formData.threadSpecification}
              onChange={(e) => updateField('threadSpecification', e.target.value)}
            />
            <TextField
              label="螺纹孔数"
              type="number"
              value={formData.threadHoleCount}
              onChange={(e) => updateField('threadHoleCount', e.target.value)}
            />
            <FormControl sx={{ minWidth: 100 }}>
              <InputLabel>类别三</InputLabel>
              <Select
                value={formData.category3}
                onChange={(e) => updateField('category3', e.target.value)}
              >
                <MenuItem value="">请选择</MenuItem>
                <MenuItem value="尖底">尖底</MenuItem>
                <MenuItem value="平底">平底</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="螺纹单价 (元)"
              type="number"
              value={formData.threadingUnitPrice}
              onChange={(e) => updateField('threadingUnitPrice', e.target.value)}
              inputProps={{ step: 0.01 }}
            />
            <TextField
              label="螺纹小计 (元)"
              value={(parseFloat(formData.threadingUnitPrice || '0') * parseInt(formData.threadHoleCount || '0')).toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 抠槽 */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>抠槽加工</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="抠槽孔数"
              type="number"
              value={formData.groovingHoleCount}
              onChange={(e) => updateField('groovingHoleCount', e.target.value)}
            />
            <TextField
              label="抠槽单价 (元)"
              type="number"
              value={formData.groovingUnitPrice}
              onChange={(e) => updateField('groovingUnitPrice', e.target.value)}
              inputProps={{ step: 0.01 }}
            />
            <TextField
              label="抠槽小计 (元)"
              value={(parseFloat(formData.groovingUnitPrice || '0') * parseInt(formData.groovingHoleCount || '0')).toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 总价 */}
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            总价: ¥{totalPrice.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      {/* 备注 */}
      <Card>
        <CardHeader title="备注信息" />
        <CardContent>
          <TextField
            label="备注"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="请输入备注信息..."
          />
        </CardContent>
      </Card>
    </Box>
  );
}
