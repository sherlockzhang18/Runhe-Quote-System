import Head from "next/head";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton
} from "@mui/material";
import {
  PriceChange,
  Receipt,
  Upload,
  ExitToApp,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { useRouter } from "next/router";
import axios from "axios";

interface User {
  id: number;
  username: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/me', { withCredentials: true });
      setUser(response.data);
    } catch {
      // 用户未登录，页面会被 RouteGuard 重定向
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return null; // RouteGuard 会显示加载状态

  return (
    <>
      <Head>
        <title>半自动报价系统 - 仪表板</title>
        <meta name="description" content="半自动报价系统管理面板" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            半自动报价系统
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            欢迎, {user?.username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          系统仪表板
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3,
          mb: 4
        }}>
          {/* 单价管理卡片 */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PriceChange color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">单价管理</Typography>
              </Box>
              <Typography color="textSecondary">
                导入和管理零件单价表，设置不同条件下的价格
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="contained"
                onClick={() => router.push('/price-management')}
              >
                管理单价
              </Button>
            </CardActions>
          </Card>

          {/* 报价管理卡片 */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Receipt color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">报价管理</Typography>
              </Box>
              <Typography color="textSecondary">
                创建新报价，自动匹配价格，管理报价单状态
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="contained"
                onClick={() => router.push('/quotes')}
              >
                管理报价
              </Button>
            </CardActions>
          </Card>

          {/* 快速导入卡片 */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Upload color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">快速导入</Typography>
              </Box>
              <Typography color="textSecondary">
                快速上传 Excel 单价表文件，更新系统价格数据
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => router.push('/price-management?tab=import')}
              >
                导入数据
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* 系统状态概览 */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            系统概览
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 2 
          }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  单价记录数
                </Typography>
                <Typography variant="h4">
                  -
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  报价单数
                </Typography>
                <Typography variant="h4">
                  -
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  今日报价
                </Typography>
                <Typography variant="h4">
                  -
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  系统状态
                </Typography>
                <Typography variant="h4" color="success.main">
                  正常
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </>
  );
}
