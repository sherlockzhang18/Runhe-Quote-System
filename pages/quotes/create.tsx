import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import RouteGuard from '../../components/RouteGuard';
import QuoteForm, { QuoteFormData } from '../../components/QuoteForm';

export default function CreateQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [formData, setFormData] = useState<QuoteFormData>({
    quoteNumber: '',
    // 规格信息
    oldMaterialCode: '',
    sapMaterialCode: '',
    materialDescription: '',
    versionNumber: '',
    processingContent: '',
    tubePlateMaterial: '',
    priceYear: 'F28',
    // 基本尺寸
    thickness: '',
    lengthOrDiameter: '',
    width: '',
    // 钻孔信息
    drillingHoleDiameter: '',
    drillingHoleCount: '',
    drillingUnitPrice: '',
    // 攻螺纹信息
    threadCategory: '',
    threadSpecification: '',
    threadHoleCount: '',
    category3: '',
    threadingUnitPrice: '',
    // 抠槽信息
    groovingHoleCount: '',
    groovingUnitPrice: '',
    // 其他
    projectName: '',
    customerName: '',
    notes: '',
  });

  // 自动获取价格
  const handleAutoPrice = async () => {
    if (!formData.priceYear) {
      setAlert({type: 'error', message: '请先选择年份'});
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch('/api/quotes/price-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 钻孔参数
          drillingCategory: '钻孔',
          drillingMaterial: formData.tubePlateMaterial,
          drillingThickness: formData.thickness,
          drillingDiameter: formData.drillingHoleDiameter,
          drillingHoleCount: formData.drillingHoleCount,
          // 螺纹参数
          threadingCategory: formData.threadCategory,
          threadingMaterial: formData.tubePlateMaterial,
          threadingSpecification: formData.threadSpecification,
          threadingHoleCount: formData.threadHoleCount,
          // 抠槽参数
          groovingCategory: '抠槽',
          groovingMaterial: formData.tubePlateMaterial,
          groovingHoleCount: formData.groovingHoleCount,
          // 年份
          priceYear: formData.priceYear,
          // 物料描述 (对应category2)
          materialDescription: formData.materialDescription
        }),
      });

      if (response.ok) {
        const prices = await response.json();
        setFormData(prev => ({
          ...prev,
          drillingUnitPrice: prices.drillingPrice?.toString() || prev.drillingUnitPrice,
          threadingUnitPrice: prices.threadingPrice?.toString() || prev.threadingUnitPrice,
          groovingUnitPrice: prices.groovingPrice?.toString() || prev.groovingUnitPrice,
        }));
        setAlert({type: 'success', message: '价格获取成功！'});
      } else {
        const data = await response.json();
        setAlert({type: 'error', message: data.error || '价格匹配失败'});
      }
    } catch (error) {
      console.error('价格匹配错误:', error);
      setAlert({type: 'error', message: '价格匹配失败'});
    } finally {
      setLoading(false);
    }
  };

  // 保存报价
  const handleSave = async () => {
    if (!formData.quoteNumber) {
      setAlert({type: 'error', message: '请输入报价单号'});
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAlert({type: 'success', message: '报价创建成功！'});
        setTimeout(() => {
          router.push('/quotes');
        }, 1500);
      } else {
        const data = await response.json();
        setAlert({type: 'error', message: data.error || '创建失败'});
      }
    } catch (error) {
      console.error('创建报价错误:', error);
      setAlert({type: 'error', message: '创建失败'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.push('/quotes')}
            >
              返回列表
            </Button>
            <Typography variant="h4">创建报价单</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存报价'}
          </Button>
        </Box>

        <QuoteForm
          formData={formData}
          onChange={setFormData}
          onAutoPrice={handleAutoPrice}
          loading={loading}
          mode="create"
          alert={alert}
        />
      </Container>
    </RouteGuard>
  );
}
