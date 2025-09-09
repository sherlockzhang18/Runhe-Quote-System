import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  ArrowBack as BackIcon,
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
  totalPrice?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotesListPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // 加载报价列表
  const loadQuotes = async (pageNum = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await fetch(`/api/quotes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
        setTotalPages(Math.ceil((data.total || 0) / 20));
      } else {
        throw new Error('获取报价列表失败');
      }
    } catch (error) {
      console.error('加载报价失败:', error);
      setAlert({type: 'error', message: '加载报价列表失败'});
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadQuotes(page, searchTerm);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // 搜索处理
  const handleSearch = () => {
    setPage(1);
    loadQuotes(1, searchTerm);
  };

  // 处理搜索框回车
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // 菜单操作
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, quote: Quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  // 查看报价详情
  const handleViewQuote = (quote: Quote) => {
    router.push(`/quotes/${quote.id}`);
    handleMenuClose();
  };

  // 编辑报价
  const handleEditQuote = (quote: Quote) => {
    router.push(`/quotes/${quote.id}/edit`);
    handleMenuClose();
  };

  // 删除报价
  const handleDeleteQuote = async (quote: Quote) => {
    if (!confirm(`确定要删除报价单 ${quote.quoteNumber} 吗？`)) {
      handleMenuClose();
      return;
    }

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlert({type: 'success', message: '删除成功'});
        loadQuotes(page, searchTerm);
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除报价失败:', error);
      setAlert({type: 'error', message: '删除失败'});
    }
    handleMenuClose();
  };

  // 导出报价
  const handleExportQuote = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `报价单_${quote.quoteNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setAlert({type: 'success', message: '导出成功'});
      } else {
        throw new Error('导出失败');
      }
    } catch (error) {
      console.error('导出报价失败:', error);
      setAlert({type: 'error', message: '导出失败'});
    }
    handleMenuClose();
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

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'confirmed': return '已确认';
      case 'exported': return '已导出';
      default: return status;
    }
  };

  return (
    <RouteGuard>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 页面头部 */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
            <Typography variant="h4">报价管理</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/quotes/create')}
          >
            创建报价
          </Button>
        </Box>

        {/* 提示信息 */}
        {alert && (
          <Alert 
            severity={alert.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        {/* 搜索和筛选 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="搜索报价单号、项目名称、客户名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleSearch}
                disabled={loading}
              >
                搜索
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 报价列表 */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>报价单号</TableCell>
                    <TableCell>项目名称</TableCell>
                    <TableCell>客户名称</TableCell>
                    <TableCell>物料编号</TableCell>
                    <TableCell>物料描述</TableCell>
                    <TableCell align="right">总价</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : quotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        暂无报价数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotes.map((quote) => (
                      <TableRow key={quote.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {quote.quoteNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{quote.projectName || '-'}</TableCell>
                        <TableCell>{quote.customerName || '-'}</TableCell>
                        <TableCell>
                          {quote.oldMaterialCode || quote.sapMaterialCode || '-'}
                        </TableCell>
                        <TableCell>{quote.materialDescription || '-'}</TableCell>
                        <TableCell align="right">
                          {quote.totalPrice ? `¥${parseFloat(quote.totalPrice).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusText(quote.status)} 
                            color={getStatusColor(quote.status)}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="更多操作">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, quote)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 分页 */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* 操作菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedQuote && handleViewQuote(selectedQuote)}>
            <ViewIcon sx={{ mr: 1 }} fontSize="small" />
            查看详情
          </MenuItem>
          <MenuItem onClick={() => selectedQuote && handleEditQuote(selectedQuote)}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            编辑
          </MenuItem>
          <MenuItem onClick={() => selectedQuote && handleExportQuote(selectedQuote)}>
            <ExportIcon sx={{ mr: 1 }} fontSize="small" />
            导出Excel
          </MenuItem>
          <MenuItem 
            onClick={() => selectedQuote && handleDeleteQuote(selectedQuote)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            删除
          </MenuItem>
        </Menu>
      </Container>
    </RouteGuard>
  );
}
