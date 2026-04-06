import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  VpnKey as KeyIcon,
  LocationOn as LocationIcon,
  Language as GlobeIcon,
  AccessTime as ClockIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3001';

interface ProxyResponse {
  status: number;
  message: string;
  proxyhttp: string;
  proxysocks5: string;
  ip: string;
  'Nha Mang': string;
  'Vi Tri': string;
  'Token expiration date': string;
}

const ProxySwitcher = () => {
  const [key, setKey] = useState<string>(localStorage.getItem('proxy_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [nhamang, setNhamang] = useState<string>('viettel');
  const [tinhthanh, setTinhthanh] = useState<string>('2');
  const [loading, setLoading] = useState<boolean>(false);
  const [proxyData, setProxyData] = useState<ProxyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('proxy_key', key);
  }, [key]);

  const beautifyMessage = (msg: string) => {
    if (!msg) return msg;
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('key khong ton tai') || lowerMsg.includes('key khong ton tai hoac het han')) {
      return 'Key không tồn tại hoặc đã hết hạn';
    }
    if (lowerMsg.includes('chua den thoi gian')) {
      return 'Chưa đến thời gian để đổi IP mới';
    }
    if (lowerMsg.includes('he thong dang bao tri')) {
      return 'Hệ thống đang bảo trì, vui lòng quay lại sau';
    }
    return msg;
  };

  const fetchProxy = async () => {
    if (!key) {
      setError('Vui lòng nhập API Key của bạn');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/proxy/get`, {
        params: { key, nhamang, tinhthanh }
      });

      if (response.data.status === 100) {
        setProxyData(response.data);
        showSnackbar('Cập nhật Proxy thành công!');
      } else {
        setError(beautifyMessage(response.data.message) || 'Không thể lấy thông tin Proxy');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`Đã sao chép ${label}`);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RefreshIcon color="primary" sx={{ animation: loading ? 'spin 2s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            Đổi Proxy (Proxy Switcher)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý và thay đổi IP Proxy của bạn từ proxyxoay.shop
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* API Key Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                variant="outlined"
                placeholder="Nhập mã API Key của bạn"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                        {showKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

            {/* Network Provider Selector */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                <InputLabel>Nhà mạng</InputLabel>
                <Select
                  value={nhamang}
                  label="Nhà mạng"
                  onChange={(e) => setNhamang(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="random">Ngẫu nhiên</MenuItem>
                  <MenuItem value="viettel">Viettel</MenuItem>
                  <MenuItem value="vinaphone">Vinaphone</MenuItem>
                  <MenuItem value="fpt">FPT</MenuItem>
                  <MenuItem value="mobifone">Mobifone</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Location Selector */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                <InputLabel>Tỉnh thành (Vị trí)</InputLabel>
                <Select
                  value={tinhthanh}
                  label="Tỉnh thành (Vị trí)"
                  onChange={(e) => setTinhthanh(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="0">Ngẫu nhiên</MenuItem>
                  <MenuItem value="1">Hà Nội</MenuItem>
                  <MenuItem value="2">Hồ Chí Minh</MenuItem>
                  <MenuItem value="3">Đà Nẵng</MenuItem>
                  <MenuItem value="4">Hải Phòng</MenuItem>
                  <MenuItem value="5">Cần Thơ</MenuItem>
                  <MenuItem value="6">Bắc Ninh</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Action Button on its own line - smaller version */}
            <Grid item xs={12} sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="medium"
                onClick={fetchProxy}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                sx={{
                  px: 6,
                  py: 1.2,
                  borderRadius: 2.5,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                  textTransform: 'none',
                  minWidth: 250
                }}
              >
                {loading ? 'Đang cập nhật...' : 'Lấy IP Mới / Làm mới Proxy'}
              </Button>
            </Grid>
          </Grid>


          {/* Error Message */}
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                variant="outlined" 
                icon={<ErrorIcon />}
                sx={{ mt: 3, borderRadius: 3, borderColor: 'error.light' }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Proxy Results */}
          {proxyData && (
            <Fade in={!!proxyData}>
              <Box sx={{ mt: 5 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    bgcolor: 'primary.50', 
                    border: '2px solid', 
                    borderColor: 'primary.100',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                    <CheckCircleIcon color="primary" />
                    <Typography variant="h6" fontWeight="700" color="primary.dark">
                      Thành công! Đã tạo Proxy mới
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Proxy URLs */}
                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          borderRadius: 3, 
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor: 'primary.100',
                          cursor: 'pointer', 
                          '&:hover': { bgcolor: 'grey.50' },
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => copyToClipboard(proxyData.proxyhttp, 'HTTP Proxy')}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" fontWeight="800" color="primary.main">HTTP PROXY</Typography>
                          <Tooltip title="Sao chép vào bộ nhớ tạm">
                            <CopyIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                          </Tooltip>
                        </Box>
                        <Typography variant="body1" sx={{ fontFamily: 'Monospace', wordBreak: 'break-all', fontWeight: 600, color: 'text.primary' }}>
                          {proxyData.proxyhttp}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          borderRadius: 3, 
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor: 'primary.100',
                          cursor: 'pointer', 
                          '&:hover': { bgcolor: 'grey.50' },
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => copyToClipboard(proxyData.proxysocks5, 'Socks5 Proxy')}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" fontWeight="800" color="secondary.main">SOCKS5 PROXY</Typography>
                          <Tooltip title="Sao chép vào bộ nhớ tạm">
                            <CopyIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                          </Tooltip>
                        </Box>
                        <Typography variant="body1" sx={{ fontFamily: 'Monospace', wordBreak: 'break-all', fontWeight: 600, color: 'text.primary' }}>
                          {proxyData.proxysocks5}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          borderRadius: 3, 
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor: 'primary.100',
                          cursor: 'pointer', 
                          '&:hover': { bgcolor: 'grey.50' },
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => copyToClipboard(proxyData.ip, 'Exit IP')}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" fontWeight="800" color="success.main">EXIT IP (IP HIỂN THỊ)</Typography>
                          <Tooltip title="Sao chép vào bộ nhớ tạm">
                            <CopyIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                          </Tooltip>
                        </Box>
                        <Typography variant="body1" sx={{ fontFamily: 'Monospace', wordBreak: 'break-all', fontWeight: 600, color: 'success.dark' }}>
                          {proxyData.ip}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Info Section */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, bgcolor: 'white', border: '1px solid', borderColor: 'primary.50' }}>
                          <GlobeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>{proxyData['Nha Mang']}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, bgcolor: 'white', border: '1px solid', borderColor: 'primary.50' }}>
                          <LocationIcon sx={{ fontSize: 20, color: 'info.main' }} />
                          <Typography variant="body2" fontWeight="600">{proxyData['Vi Tri']}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, bgcolor: 'white', border: '1px solid', borderColor: 'primary.50' }}>
                          <ClockIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                          <Typography variant="body2" fontWeight="600">{proxyData['Token expiration date']}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" fontStyle="italic">
                        * {beautifyMessage(proxyData.message)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          icon={<CheckCircleIcon fontSize="small" />}
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProxySwitcher;
