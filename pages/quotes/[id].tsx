import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import RouteGuard from '../../components/RouteGuard';

interface Quote {
  id: number;
  quoteNumber: string;
  projectName?: string;
  customerName?: string;
  oldMaterialCode?: string;
  sapMaterialCode?: string;
  materialDescription?: string;
  versionNumber?: string;
  processingContent?: string;
  tubePlateMaterial?: string;
  priceYear?: string;
  thickness?: string;
  lengthOrDiameter?: string;
  width?: string;
  drillingHoleDiameter?: string;
  drillingHoleCount?: number;
  drillingUnitPrice?: string;
  threadCategory?: string;
  threadSpecification?: string;
  threadHoleCount?: number;
  category3?: string;
  threadingUnitPrice?: string;
  groovingHoleCount?: number;
  groovingUnitPrice?: string;
  totalPrice?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuoteDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载报价详情
  useEffect(() => {
    if (!id) return;

    const loadQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
        } else {
          setError('报价不存在或无权访问');
        }
      } catch (error) {
        console.error('加载报价失败:', error);
        setError('加载报价失败');
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [id]);

  // 导出报价
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/quotes/${id}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `报价单_${quote?.quoteNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('导出失败');
      }
    } catch (error) {
      console.error('导出报价失败:', error);
      setError('导出失败');
    }
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'confirmed': return '已确认';
      case 'exported': return '已导出';
      default: return status;
    }
  };

  // 状态颜色映射
  const getStatusColor = (status: string): 'default' | 'success' | 'info' => {
    switch (status) {
      case 'draft': return 'default';
      case 'confirmed': return 'success';
      case 'exported': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <RouteGuard>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>加载中...</Typography>
        </Container>
      </RouteGuard>
    );
  }

  if (error) {
    return (
      <RouteGuard>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </RouteGuard>
    );
  }

  if (!quote) {
    return (
      <RouteGuard>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">报价不存在</Alert>
        </Container>
      </RouteGuard>
    );
  }

  // 创建详情数据数组
  const detailData = [
    { label: '报价单号', value: quote.quoteNumber },
    { label: '项目名称', value: quote.projectName || '-' },
    { label: '客户名称', value: quote.customerName || '-' },
    { label: '旧物料编号', value: quote.oldMaterialCode || '-' },
    { label: 'SAP物料', value: quote.sapMaterialCode || '-' },
    { label: '物料描述', value: quote.materialDescription || '-' },
    { label: '版本号', value: quote.versionNumber || '-' },
    { label: '管板材质', value: quote.tubePlateMaterial || '-' },
    { label: '价格年份', value: quote.priceYear || '-' },
    { label: '厚度', value: quote.thickness || '-' },
    { label: '长/直径', value: quote.lengthOrDiameter || '-' },
    { label: '宽', value: quote.width || '-' },
    { label: '钻孔孔径', value: quote.drillingHoleDiameter || '-' },
    { label: '钻孔孔数', value: quote.drillingHoleCount || '-' },
    { label: '钻孔单价', value: quote.drillingUnitPrice ? `¥${parseFloat(quote.drillingUnitPrice).toFixed(4)}` : '-' },
    { label: '螺纹类别', value: quote.threadCategory || '-' },
    { label: '螺纹孔型号', value: quote.threadSpecification || '-' },
    { label: '螺纹孔数', value: quote.threadHoleCount || '-' },
    { label: '类别三', value: quote.category3 || '-' },
    { label: '攻螺纹单价', value: quote.threadingUnitPrice ? `¥${parseFloat(quote.threadingUnitPrice).toFixed(4)}` : '-' },
    { label: '抠槽孔数', value: quote.groovingHoleCount || '-' },
    { label: '抠槽单价', value: quote.groovingUnitPrice ? `¥${parseFloat(quote.groovingUnitPrice).toFixed(4)}` : '-' },
    { label: '总价', value: quote.totalPrice ? `¥${parseFloat(quote.totalPrice).toFixed(2)}` : '-' },
    { label: '创建时间', value: new Date(quote.createdAt).toLocaleString() },
    { label: '更新时间', value: new Date(quote.updatedAt).toLocaleString() },
  ];

  return (
    <RouteGuard>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 页面头部 */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.push('/quotes')}
            >
              返回列表
            </Button>
            <Typography variant="h4">报价详情</Typography>
            <Chip 
              label={getStatusText(quote.status)} 
              color={getStatusColor(quote.status)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/quotes/${id}/edit`)}
            >
              编辑
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={handleExport}
            >
              导出Excel
            </Button>
          </Box>
        </Box>

        {/* 报价详情 */}
        <Card>
          <CardHeader title={`报价单：${quote.quoteNumber}`} />
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableBody>
                  {detailData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', width: '200px' }}>
                        {item.label}
                      </TableCell>
                      <TableCell>{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 备注信息 */}
            {quote.notes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  备注信息
                </Typography>
                <Typography variant="body1" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  {quote.notes}
                </Typography>
              </Box>
            )}

            {/* 价格计算明细 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                价格计算明细
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>钻孔费用</TableCell>
                    <TableCell align="right">
                      {quote.drillingUnitPrice && quote.drillingHoleCount
                        ? `¥${parseFloat(quote.drillingUnitPrice).toFixed(4)} × ${quote.drillingHoleCount} = ¥${(parseFloat(quote.drillingUnitPrice) * quote.drillingHoleCount).toFixed(2)}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>攻螺纹费用</TableCell>
                    <TableCell align="right">
                      {quote.threadingUnitPrice && quote.threadHoleCount
                        ? `¥${parseFloat(quote.threadingUnitPrice).toFixed(4)} × ${quote.threadHoleCount} = ¥${(parseFloat(quote.threadingUnitPrice) * quote.threadHoleCount).toFixed(2)}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>抠槽费用</TableCell>
                    <TableCell align="right">
                      {quote.groovingUnitPrice && quote.groovingHoleCount
                        ? `¥${parseFloat(quote.groovingUnitPrice).toFixed(4)} × ${quote.groovingHoleCount} = ¥${(parseFloat(quote.groovingUnitPrice) * quote.groovingHoleCount).toFixed(2)}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>总计</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {quote.totalPrice ? `¥${parseFloat(quote.totalPrice).toFixed(2)}` : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </RouteGuard>
  );
}
