import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import RouteGuard from '../../../components/RouteGuard';
import QuoteForm, { QuoteFormData } from '../../../components/QuoteForm';

export default function EditQuotePage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const loadQuoteData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/quotes/${id}`);
      
      if (response.ok) {
        const quote = await response.json();
        console.log('Loaded quote data:', quote); // 调试：查看原始数据
        console.log('Thickness from DB:', quote.thickness, typeof quote.thickness); // 调试：查看厚度数据
        
        // 转换后端数据到表单格式 (数据库返回camelCase)
        setFormData({
          quoteNumber: quote.quoteNumber || '',
          oldMaterialCode: quote.oldMaterialCode || '',
          sapMaterialCode: quote.sapMaterialCode || '',
          materialDescription: quote.materialDescription || '',
          versionNumber: quote.versionNumber || '',
          processingContent: quote.processingContent || '',
          tubePlateMaterial: quote.tubePlateMaterial || '',
          priceYear: quote.priceYear || 'F28',
          thickness: quote.thickness?.toString() || '',
          lengthOrDiameter: quote.lengthOrDiameter?.toString() || '',
          width: quote.width?.toString() || '',
          drillingHoleDiameter: quote.drillingHoleDiameter?.toString() || '',
          drillingHoleCount: quote.drillingHoleCount?.toString() || '',
          drillingUnitPrice: quote.drillingUnitPrice?.toString() || '',
          threadCategory: quote.threadCategory || '',
          threadSpecification: quote.threadSpecification?.toString() || '',
          threadHoleCount: quote.threadHoleCount?.toString() || '',
          category3: quote.category3 || '',
          threadingUnitPrice: quote.threadingUnitPrice?.toString() || '',
          groovingHoleCount: quote.groovingHoleCount?.toString() || '',
          groovingUnitPrice: quote.groovingUnitPrice?.toString() || '',
          projectName: quote.projectName || '',
          customerName: quote.customerName || '',
          notes: quote.notes || '',
        });
      } else {
        setAlert({type: 'error', message: '加载报价数据失败'});
      }
    } catch (error) {
      console.error('加载报价数据错误:', error);
      setAlert({type: 'error', message: '加载报价数据失败'});
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  // 加载报价数据
  useEffect(() => {
    if (id) {
      loadQuoteData();
    }
  }, [id, loadQuoteData]);

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
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAlert({type: 'success', message: '报价更新成功！'});
        setTimeout(() => {
          router.push('/quotes');
        }, 1500);
      } else {
        const data = await response.json();
        setAlert({type: 'error', message: data.error || '更新失败'});
      }
    } catch (error) {
      console.error('更新报价错误:', error);
      setAlert({type: 'error', message: '更新失败'});
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <RouteGuard>
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
      </RouteGuard>
    );
  }

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
            <Typography variant="h4">编辑报价单</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存修改'}
          </Button>
        </Box>

        <QuoteForm
          formData={formData}
          onChange={setFormData}
          onAutoPrice={handleAutoPrice}
          loading={loading}
          mode="edit"
          alert={alert}
        />
      </Container>
    </RouteGuard>
  );
}
