import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Upload,
  Add,
  Edit,
  Delete,
  Download,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  FilterList
} from '@mui/icons-material';
import RouteGuard from '../components/RouteGuard';
import axios from 'axios';

interface PriceItem {
  id: number;
  category1: string; // 必填字段
  category2: string | null;
  category3: string | null;
  material: string | null;
  thickness: string | null;
  minHoleDiameter: string | null; // 更新字段名
  maxHoleDiameter: string | null; // 更新字段名
  minHoles: number | null;
  maxHoles: number | null;
  f25Price: string | null;
  f26Price: string | null;
  f27Price: string | null;
  f28Price: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`price-tabpanel-${index}`}
      aria-labelledby={`price-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PriceManagement() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // 排序和筛选状态
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    category1: '',
    category2: '',
    material: '',
    search: ''
  });

  // 格式化价格显示（两位小数）
  const formatPrice = (price: string | null): string => {
    if (!price) return '-';
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '-' : `¥${numPrice.toFixed(2)}`;
  };

  // 排序处理
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 筛选和排序数据
  const filteredAndSortedItems = priceItems
    .filter(item => {
      const matchesCategory1 = !filters.category1 || item.category1 === filters.category1;
      const matchesCategory2 = !filters.category2 || item.category2?.includes(filters.category2);
      const matchesMaterial = !filters.material || item.material?.includes(filters.material);
      const matchesSearch = !filters.search || 
        (item.category1?.toLowerCase().includes(filters.search.toLowerCase()) ||
         item.category2?.toLowerCase().includes(filters.search.toLowerCase()) ||
         item.material?.toLowerCase().includes(filters.search.toLowerCase()));
      
      return matchesCategory1 && matchesCategory2 && matchesMaterial && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'category1':
          aValue = a.category1 || '';
          bValue = b.category1 || '';
          break;
        case 'material':
          aValue = a.material || '';
          bValue = b.material || '';
          break;
        case 'f25Price':
          aValue = parseFloat(a.f25Price || '0');
          bValue = parseFloat(b.f25Price || '0');
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt || 0).getTime();
          bValue = new Date(b.updatedAt || 0).getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  // 获取唯一的分类和材质选项
  const uniqueCategories1 = [...new Set(priceItems.map(item => item.category1).filter(Boolean))] as string[];
  const uniqueCategories2 = [...new Set(priceItems.map(item => item.category2).filter(Boolean))] as string[];
  const uniqueMaterials = [...new Set(priceItems.map(item => item.material).filter(Boolean))] as string[];

  // 表单状态
  const [formData, setFormData] = useState({
    category1: '',
    category2: '',
    category3: '',
    material: '',
    thickness: '',
    minHoleDiameter: '',
    maxHoleDiameter: '',
    minHoles: '',
    maxHoles: '',
    f25Price: '',
    f26Price: '',
    f27Price: '',
    f28Price: ''
  });

  // 获取URL参数，如果有tab参数则切换到对应标签
  useEffect(() => {
    if (router.query.tab === 'import') {
      setTabValue(1);
    }
  }, [router.query.tab]);

  // 加载价格数据
  const loadPriceItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/price-items');
      setPriceItems(response.data);
    } catch (error) {
      console.error('加载价格数据失败:', error);
      setAlert({type: 'error', message: '加载价格数据失败'});
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadPriceItems();
  }, []);

  // 处理标签切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 处理文件上传
  // 添加价格项
  const handleAddItem = async () => {
    try {
      await axios.post('/api/price-items', formData);
      
      setAlert({type: 'success', message: '添加成功'});
      setOpenAddDialog(false);
      resetForm();
      loadPriceItems();
    } catch (error: unknown) {
      console.error('添加失败:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '添加失败';
      setAlert({type: 'error', message: errorMessage || '添加失败'});
    }
  };

  // 编辑价格项
  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      await axios.put(`/api/price-items/${editingItem.id}`, formData);
      
      setAlert({type: 'success', message: '更新成功'});
      setOpenEditDialog(false);
      setEditingItem(null);
      resetForm();
      loadPriceItems();
    } catch (error: unknown) {
      console.error('更新失败:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '更新失败';
      setAlert({type: 'error', message: errorMessage || '更新失败'});
    }
  };

  // 删除价格项
  const handleDeleteItem = async (id: number) => {
    if (!confirm('确定要删除这个价格项吗？')) return;

    try {
      await axios.delete(`/api/price-items/${id}`);
      setAlert({type: 'success', message: '删除成功'});
      loadPriceItems();
    } catch (error: unknown) {
      console.error('删除失败:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '删除失败';
      setAlert({type: 'error', message: errorMessage || '删除失败'});
    }
  };

  // 打开编辑对话框
  const handleOpenEditDialog = (item: PriceItem) => {
    setEditingItem(item);
    setFormData({
      category1: item.category1 || '',
      category2: item.category2 || '',
      category3: item.category3 || '',
      material: item.material || '',
      thickness: item.thickness || '',
      minHoleDiameter: item.minHoleDiameter || '',
      maxHoleDiameter: item.maxHoleDiameter || '',
      minHoles: item.minHoles?.toString() || '',
      maxHoles: item.maxHoles?.toString() || '',
      f25Price: item.f25Price || '',
      f26Price: item.f26Price || '',
      f27Price: item.f27Price || '',
      f28Price: item.f28Price || ''
    });
    setOpenEditDialog(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      category1: '',
      category2: '',
      category3: '',
      material: '',
      thickness: '',
      minHoleDiameter: '',
      maxHoleDiameter: '',
      minHoles: '',
      maxHoles: '',
      f25Price: '',
      f26Price: '',
      f27Price: '',
      f28Price: ''
    });
  };

  // Excel导入功能
  const handleImportExcel = async (file: File) => {
    if (!file) return;

    setImporting(true);
    setImportResults(null);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('excel', file);

      const response = await axios.post('/api/price-items/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { results } = response.data;
      setImportResults(results);
      
      if (results.success > 0) {
        setAlert({
          type: 'success', 
          message: `成功导入 ${results.success} 条记录${results.failed > 0 ? `，失败 ${results.failed} 条` : ''}`
        });
        loadPriceItems(); // 重新加载数据
      } else {
        setAlert({type: 'error', message: '导入失败，请检查文件格式'});
      }
    } catch (error) {
      console.error('Excel导入失败:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '导入失败';
      setAlert({type: 'error', message: errorMessage || '导入失败'});
    } finally {
      setImporting(false);
    }
  };

  // 文件选择处理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportExcel(file);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const response = await axios.get('/api/price-items/export', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `价格表_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      setAlert({type: 'error', message: '导出失败'});
    }
  };

  return (
    <RouteGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            价格管理
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            导出Excel
          </Button>
        </Box>

        {alert && (
          <Alert 
            severity={alert.type} 
            sx={{ mb: 2 }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="价格列表" />
              <Tab label="批量导入" />
            </Tabs>
          </Box>

          {/* 价格列表标签 */}
          <TabPanel value={tabValue} index={0}>
            {/* 筛选和搜索区域 */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="搜索分类、材质..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>一级分类</InputLabel>
                <Select
                  value={filters.category1}
                  onChange={(e) => setFilters({...filters, category1: e.target.value})}
                >
                  <MenuItem value="">全部</MenuItem>
                  {uniqueCategories1.filter(cat => cat).map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>二级分类</InputLabel>
                <Select
                  value={filters.category2}
                  onChange={(e) => setFilters({...filters, category2: e.target.value})}
                >
                  <MenuItem value="">全部</MenuItem>
                  {uniqueCategories2.filter(cat => cat).map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>材质</InputLabel>
                <Select
                  value={filters.material}
                  onChange={(e) => setFilters({...filters, material: e.target.value})}
                >
                  <MenuItem value="">全部</MenuItem>
                  {uniqueMaterials.map(material => (
                    <MenuItem key={material} value={material}>{material}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({category1: '', category2: '', material: '', search: ''})}
              >
                清除筛选
              </Button>
            </Box>

            {/* 操作按钮区域 */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddDialog(true)}
              >
                添加价格项
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadPriceItems}
              >
                刷新
              </Button>
              <Typography variant="body2" sx={{ ml: 'auto', alignSelf: 'center' }}>
                显示 {filteredAndSortedItems.length} / {priceItems.length} 条记录
              </Typography>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <TableContainer component={Paper} sx={{ maxHeight: 600, position: 'relative' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ minWidth: 60, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('id')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        ID
                        {sortBy === 'id' && (
                          sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ minWidth: 100, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('category1')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        一级分类
                        {sortBy === 'category1' && (
                          sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>二级分类</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>三级分类</TableCell>
                    <TableCell 
                      sx={{ minWidth: 120, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('material')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        材质
                        {sortBy === 'material' && (
                          sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>厚度</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>最小孔径</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>最大孔径</TableCell>
                    <TableCell sx={{ minWidth: 80 }}>最小孔数</TableCell>
                    <TableCell sx={{ minWidth: 80 }}>最大孔数</TableCell>
                    <TableCell 
                      sx={{ minWidth: 100, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('f25Price')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        F25价格
                        {sortBy === 'f25Price' && (
                          sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>F26价格</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>F27价格</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>F28价格</TableCell>
                    <TableCell 
                      sx={{ minWidth: 120, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('updatedAt')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        更新时间
                        {sortBy === 'updatedAt' && (
                          sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        minWidth: 120, 
                        position: 'sticky', 
                        right: 0, 
                        backgroundColor: 'white',
                        boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                        zIndex: 3 // 提高层级
                      }}
                    >
                      操作
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        {item.category1 && <Chip label={item.category1} size="small" />}
                      </TableCell>
                      <TableCell>{item.category2}</TableCell>
                      <TableCell>{item.category3}</TableCell>
                      <TableCell>{item.material}</TableCell>
                      <TableCell>{item.thickness}</TableCell>
                      <TableCell>{item.minHoleDiameter}</TableCell>
                      <TableCell>{item.maxHoleDiameter}</TableCell>
                      <TableCell>{item.minHoles}</TableCell>
                      <TableCell>{item.maxHoles}</TableCell>
                      <TableCell>{formatPrice(item.f25Price)}</TableCell>
                      <TableCell>{formatPrice(item.f26Price)}</TableCell>
                      <TableCell>{formatPrice(item.f27Price)}</TableCell>
                      <TableCell>{formatPrice(item.f28Price)}</TableCell>
                      <TableCell>
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          position: 'sticky', 
                          right: 0, 
                          backgroundColor: 'white',
                          boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                          zIndex: 2
                        }}
                      >
                        <Tooltip title="编辑">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenEditDialog(item)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {priceItems.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={18} align="center">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 批量导入标签 */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" gutterBottom>
                Excel文件导入
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              </Typography>

              <Box sx={{ mb: 3 }}>
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="excel-import-input"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="excel-import-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    disabled={importing}
                    sx={{ mr: 2 }}
                  >
                    {importing ? '导入中...' : '选择Excel文件'}
                  </Button>
                </label>
                
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => window.open('/api/price-items/template', '_blank')}
                >
                  下载模板
                </Button>
              </Box>

              {importing && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    正在导入数据，请稍候...
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  使用说明
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1. 点击&quot;下载模板&quot;获取标准Excel模板<br/>
                  2. 按照模板格式填写价格数据<br/>
                  3. 点击&quot;选择Excel文件&quot;上传填好的文件<br/>
                  4. 系统将自动验证并导入数据
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Card>

        {/* 添加价格项对话框 */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>添加价格项</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>一级分类</InputLabel>
                <Select
                  value={formData.category1}
                  onChange={(e) => setFormData({...formData, category1: e.target.value})}
                >
                  <MenuItem value="钻孔">钻孔</MenuItem>
                  <MenuItem value="抠槽">抠槽</MenuItem>
                  <MenuItem value="螺纹盲孔">螺纹盲孔</MenuItem>
                  <MenuItem value="螺纹通孔">螺纹通孔</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>二级分类</InputLabel>
                <Select
                  value={formData.category2}
                  onChange={(e) => setFormData({...formData, category2: e.target.value})}
                >
                  <MenuItem value="">无</MenuItem>
                  <MenuItem value="ABS">ABS</MenuItem>
                  <MenuItem value="非ABS">非ABS</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>三级分类</InputLabel>
                <Select
                  value={formData.category3}
                  onChange={(e) => setFormData({...formData, category3: e.target.value})}
                >
                  <MenuItem value="">无</MenuItem>
                  <MenuItem value="尖底">尖底</MenuItem>
                  <MenuItem value="平底">平底</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>材质</InputLabel>
                <Select
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                >
                  <MenuItem value="">无</MenuItem>
                  <MenuItem value="不锈钢">不锈钢</MenuItem>
                  <MenuItem value="普通材质">普通材质</MenuItem>
                  <MenuItem value="09MnNiDⅢ">09MnNiDⅢ</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="厚度"
                type="number"
                value={formData.thickness}
                onChange={(e) => setFormData({...formData, thickness: e.target.value})}
                fullWidth
              />
              <TextField
                label="最小孔径"
                type="number"
                value={formData.minHoleDiameter}
                onChange={(e) => setFormData({...formData, minHoleDiameter: e.target.value})}
                fullWidth
              />
              <TextField
                label="最大孔径"
                type="number"
                value={formData.maxHoleDiameter}
                onChange={(e) => setFormData({...formData, maxHoleDiameter: e.target.value})}
                fullWidth
              />
              <TextField
                label="最小孔数"
                type="number"
                value={formData.minHoles}
                onChange={(e) => setFormData({...formData, minHoles: e.target.value})}
                fullWidth
              />
              <TextField
                label="最大孔数"
                type="number"
                value={formData.maxHoles}
                onChange={(e) => setFormData({...formData, maxHoles: e.target.value})}
                fullWidth
              />
              <TextField
                label="F25价格"
                type="number"
                value={formData.f25Price}
                onChange={(e) => setFormData({...formData, f25Price: e.target.value})}
                fullWidth
              />
              <TextField
                label="F26价格"
                type="number"
                value={formData.f26Price}
                onChange={(e) => setFormData({...formData, f26Price: e.target.value})}
                fullWidth
              />
              <TextField
                label="F27价格"
                type="number"
                value={formData.f27Price}
                onChange={(e) => setFormData({...formData, f27Price: e.target.value})}
                fullWidth
              />
              <TextField
                label="F28价格"
                type="number"
                value={formData.f28Price}
                onChange={(e) => setFormData({...formData, f28Price: e.target.value})}
                fullWidth
              />
              <TextField
                type="number"
                fullWidth
              />
              <TextField
                type="number"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>取消</Button>
            <Button onClick={handleAddItem} variant="contained">添加</Button>
          </DialogActions>
        </Dialog>

        {/* 编辑价格项对话框 */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>编辑价格项</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>一级分类</InputLabel>
                <Select
                  value={formData.category1}
                  onChange={(e) => setFormData({...formData, category1: e.target.value})}
                >
                  <MenuItem value="钻孔">钻孔</MenuItem>
                  <MenuItem value="抠槽">抠槽</MenuItem>
                  <MenuItem value="螺纹盲孔">螺纹盲孔</MenuItem>
                  <MenuItem value="螺纹通孔">螺纹通孔</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>二级分类</InputLabel>
                <Select
                  value={formData.category2}
                  onChange={(e) => setFormData({...formData, category2: e.target.value})}
                >
                  <MenuItem value="">无</MenuItem>
                  <MenuItem value="ABS">ABS</MenuItem>
                  <MenuItem value="非ABS">非ABS</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>三级分类</InputLabel>
                <Select
                  value={formData.category3}
                  onChange={(e) => setFormData({...formData, category3: e.target.value})}
                >
                  <MenuItem value="">无</MenuItem>
                  <MenuItem value="尖底">尖底</MenuItem>
                  <MenuItem value="平底">平底</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>材质</InputLabel>
                <Select
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                >
                  <MenuItem value="">无</MenuItem>
                  <MenuItem value="不锈钢">不锈钢</MenuItem>
                  <MenuItem value="普通材质">普通材质</MenuItem>
                  <MenuItem value="09MnNiDⅢ">09MnNiDⅢ</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="厚度"
                type="number"
                value={formData.thickness}
                onChange={(e) => setFormData({...formData, thickness: e.target.value})}
                fullWidth
              />
              <TextField
                label="最小孔径"
                type="number"
                value={formData.minHoleDiameter}
                onChange={(e) => setFormData({...formData, minHoleDiameter: e.target.value})}
                fullWidth
              />
              <TextField
                label="最大孔径"
                type="number"
                value={formData.maxHoleDiameter}
                onChange={(e) => setFormData({...formData, maxHoleDiameter: e.target.value})}
                fullWidth
              />
              <TextField
                label="最小孔数"
                type="number"
                value={formData.minHoles}
                onChange={(e) => setFormData({...formData, minHoles: e.target.value})}
                fullWidth
              />
              <TextField
                label="最大孔数"
                type="number"
                value={formData.maxHoles}
                onChange={(e) => setFormData({...formData, maxHoles: e.target.value})}
                fullWidth
              />
              <TextField
                label="F25价格"
                type="number"
                value={formData.f25Price}
                onChange={(e) => setFormData({...formData, f25Price: e.target.value})}
                fullWidth
              />
              <TextField
                label="F26价格"
                type="number"
                value={formData.f26Price}
                onChange={(e) => setFormData({...formData, f26Price: e.target.value})}
                fullWidth
              />
              <TextField
                label="F27价格"
                type="number"
                value={formData.f27Price}
                onChange={(e) => setFormData({...formData, f27Price: e.target.value})}
                fullWidth
              />
              <TextField
                label="F28价格"
                type="number"
                value={formData.f28Price}
                onChange={(e) => setFormData({...formData, f28Price: e.target.value})}
                fullWidth
              />
              <TextField
                type="number"
                fullWidth
              />
              <TextField
                type="number"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>取消</Button>
            <Button onClick={handleEditItem} variant="contained">保存</Button>
          </DialogActions>
        </Dialog>

        {/* 导入结果对话框 */}
        <Dialog 
          open={!!importResults} 
          onClose={() => setImportResults(null)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>导入结果</DialogTitle>
          <DialogContent>
            {importResults && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  导入统计
                </Typography>
                <Typography color="success.main">
                  成功导入：{importResults.success} 条记录
                </Typography>
                <Typography color="error.main">
                  导入失败：{importResults.failed} 条记录
                </Typography>
                
                {importResults.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      错误详情
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {importResults.errors.map((error, index) => (
                        <Alert key={index} severity="error" sx={{ mb: 1 }}>
                          {error}
                        </Alert>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportResults(null)}>
              关闭
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </RouteGuard>
  );
}
