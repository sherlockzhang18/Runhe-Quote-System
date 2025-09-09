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
  category1: string | null;
  category2: string | null;
  category3: string | null;
  material: string | null;
  thickness: string | null;
  minHoleDistance: string | null;
  maxHoleDistance: string | null;
  minHoles: number | null;
  maxHoles: number | null;
  f25Price: string | null;
  f26Price: string | null;
  f27Price: string | null;
  f28Price: string | null;
  threadingPrice: string | null;
  groovingPrice: string | null;
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

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

  // 获取唯一的分类和材料选项
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
    minHoleDistance: '',
    maxHoleDistance: '',
    minHoles: '',
    maxHoles: '',
    f25Price: '',
    f26Price: '',
    f27Price: '',
    f28Price: '',
    threadingPrice: '',
    groovingPrice: ''
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
  const handleFileUpload = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post('/api/price-items/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      setAlert({type: 'success', message: `成功导入 ${response.data.imported} 条记录`});
      setUploadFile(null);
      loadPriceItems(); // 重新加载数据
    } catch (error: unknown) {
      console.error('上传失败:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
        : '上传失败';
      setAlert({type: 'error', message: errorMessage || '上传失败'});
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

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
      minHoleDistance: item.minHoleDistance || '',
      maxHoleDistance: item.maxHoleDistance || '',
      minHoles: item.minHoles?.toString() || '',
      maxHoles: item.maxHoles?.toString() || '',
      f25Price: item.f25Price || '',
      f26Price: item.f26Price || '',
      f27Price: item.f27Price || '',
      f28Price: item.f28Price || '',
      threadingPrice: item.threadingPrice || '',
      groovingPrice: item.groovingPrice || ''
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
      minHoleDistance: '',
      maxHoleDistance: '',
      minHoles: '',
      maxHoles: '',
      f25Price: '',
      f26Price: '',
      f27Price: '',
      f28Price: '',
      threadingPrice: '',
      groovingPrice: ''
    });
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
                placeholder="搜索分类、材料..."
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
                <InputLabel>材料</InputLabel>
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
                        材料
                        {sortBy === 'material' && (
                          sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>厚度</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>最小孔距</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>最大孔距</TableCell>
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
                    <TableCell sx={{ minWidth: 100 }}>螺纹价格</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>开槽价格</TableCell>
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
                      <TableCell>{item.minHoleDistance}</TableCell>
                      <TableCell>{item.maxHoleDistance}</TableCell>
                      <TableCell>{item.minHoles}</TableCell>
                      <TableCell>{item.maxHoles}</TableCell>
                      <TableCell>{formatPrice(item.f25Price)}</TableCell>
                      <TableCell>{formatPrice(item.f26Price)}</TableCell>
                      <TableCell>{formatPrice(item.f27Price)}</TableCell>
                      <TableCell>{formatPrice(item.f28Price)}</TableCell>
                      <TableCell>{formatPrice(item.threadingPrice)}</TableCell>
                      <TableCell>{formatPrice(item.groovingPrice)}</TableCell>
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
                请选择包含价格数据的Excel文件。文件应包含以下列：一级分类、二级分类、三级分类、材料、厚度、最小孔距、最大孔距、最小孔数、最大孔数、F25价格、F26价格、F27价格、F28价格、螺纹价格、开槽价格。
              </Typography>

              <Box sx={{ mb: 3 }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  id="excel-upload"
                />
                <label htmlFor="excel-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    sx={{ mr: 2 }}
                  >
                    选择文件
                  </Button>
                </label>
                {uploadFile && (
                  <Typography variant="body2" component="span">
                    已选择: {uploadFile.name}
                  </Typography>
                )}
              </Box>

              {uploadProgress > 0 && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    上传进度: {uploadProgress}%
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleFileUpload}
                disabled={!uploadFile || loading}
                startIcon={<Upload />}
              >
                {loading ? '上传中...' : '开始导入'}
              </Button>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Excel模板下载
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  下载标准模板文件，按照格式填写数据后上传。
                </Typography>
                <Button variant="outlined" size="small">
                  下载模板
                </Button>
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
                  <MenuItem value="机械零件">机械零件</MenuItem>
                  <MenuItem value="紧固件">紧固件</MenuItem>
                  <MenuItem value="标准件">标准件</MenuItem>
                  <MenuItem value="其他">其他</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="二级分类"
                value={formData.category2}
                onChange={(e) => setFormData({...formData, category2: e.target.value})}
                fullWidth
              />
              <TextField
                label="三级分类"
                value={formData.category3}
                onChange={(e) => setFormData({...formData, category3: e.target.value})}
                fullWidth
              />
              <TextField
                label="材料"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="厚度"
                type="number"
                value={formData.thickness}
                onChange={(e) => setFormData({...formData, thickness: e.target.value})}
                fullWidth
              />
              <TextField
                label="最小孔距"
                type="number"
                value={formData.minHoleDistance}
                onChange={(e) => setFormData({...formData, minHoleDistance: e.target.value})}
                fullWidth
              />
              <TextField
                label="最大孔距"
                type="number"
                value={formData.maxHoleDistance}
                onChange={(e) => setFormData({...formData, maxHoleDistance: e.target.value})}
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
                label="螺纹价格"
                type="number"
                value={formData.threadingPrice}
                onChange={(e) => setFormData({...formData, threadingPrice: e.target.value})}
                fullWidth
              />
              <TextField
                label="开槽价格"
                type="number"
                value={formData.groovingPrice}
                onChange={(e) => setFormData({...formData, groovingPrice: e.target.value})}
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
                  <MenuItem value="机械零件">机械零件</MenuItem>
                  <MenuItem value="紧固件">紧固件</MenuItem>
                  <MenuItem value="标准件">标准件</MenuItem>
                  <MenuItem value="其他">其他</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="二级分类"
                value={formData.category2}
                onChange={(e) => setFormData({...formData, category2: e.target.value})}
                fullWidth
              />
              <TextField
                label="三级分类"
                value={formData.category3}
                onChange={(e) => setFormData({...formData, category3: e.target.value})}
                fullWidth
              />
              <TextField
                label="材料"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="厚度"
                type="number"
                value={formData.thickness}
                onChange={(e) => setFormData({...formData, thickness: e.target.value})}
                fullWidth
              />
              <TextField
                label="最小孔距"
                type="number"
                value={formData.minHoleDistance}
                onChange={(e) => setFormData({...formData, minHoleDistance: e.target.value})}
                fullWidth
              />
              <TextField
                label="最大孔距"
                type="number"
                value={formData.maxHoleDistance}
                onChange={(e) => setFormData({...formData, maxHoleDistance: e.target.value})}
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
                label="螺纹价格"
                type="number"
                value={formData.threadingPrice}
                onChange={(e) => setFormData({...formData, threadingPrice: e.target.value})}
                fullWidth
              />
              <TextField
                label="开槽价格"
                type="number"
                value={formData.groovingPrice}
                onChange={(e) => setFormData({...formData, groovingPrice: e.target.value})}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>取消</Button>
            <Button onClick={handleEditItem} variant="contained">保存</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </RouteGuard>
  );
}
