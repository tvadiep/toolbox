import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  Send as GenerateIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Telegram as TelegramIcon,
  PersonAdd as UserIcon,
  Delete as DeleteIcon,
  TableChart as ExcelIcon,
  Science as MockIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface GeneratedLink {
  name: string;
  links: { name: string, link: string }[];
  status: 'success' | 'error';
  error?: string;
}

const TelegramLinkGen = () => {
  const [botToken, setBotToken] = useState('8710283436:AAHhZQ8CZoXAwmtDaG1usPQL6fNiY1IzFw0');
  const [chatId, setChatId] = useState('@HongVuCapital');
  const [nameList, setNameList] = useState('');
  const [results, setResults] = useState<GeneratedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleGenerate = async (isMock = false) => {
    const tokenToUse = isMock ? 'MOCK_TOKEN' : botToken;
    
    if (!isMock && (!tokenToUse.trim() || !chatId.trim() || !nameList.trim())) {
      showSnackbar('Vui lòng điền đầy đủ Token, Chat ID và danh sách tên!', 'error');
      return;
    }
    
    if (isMock && !nameList.trim()) {
      showSnackbar('Vui lòng nhập danh sách tên để thử nghiệm!', 'error');
      return;
    }

    const names = nameList.split('\n').filter(n => n.trim() !== '');
    setLoading(true);
    setResults([]);

    try {
      const response = await axios.post('http://localhost:3001/api/telegram/create-links', {
        botToken: tokenToUse,
        chatId: isMock ? 'MOCK_CHAT' : chatId,
        names
      });
      setResults(response.data.results);
      showSnackbar(isMock ? 'Đã tạo dữ liệu giả lập (Mock)!' : `Đã tạo thành công các link!`, 'success');
    } catch (error: any) {
      console.error('Error generating links:', error);
      showSnackbar('Lỗi: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`Đã sao chép ${label}!`, 'success');
  };

  const copyAllForExcel = () => {
    // Để 2 link nằm chung 1 ô trong Excel/Google Sheet:
    // Ta bọc chúng trong dấu ngoặc kép " " và dùng dấu xuống dòng \n bên trong
    const excelContent = results
      .filter(r => r.status === 'success')
      .map(r => `"${r.links.map(l => l.link).join('\n')}"`)
      .join('\n');
    
    navigator.clipboard.writeText(excelContent);
    showSnackbar('Đã copy định dạng 1 ô (2 dòng)!', 'success');
  };

  const copyOnlyLinksList = () => {
    const linksOnly = results
      .filter(r => r.status === 'success')
      .flatMap(r => r.links.map(l => l.link))
      .join('\n');
    
    navigator.clipboard.writeText(linksOnly);
    showSnackbar('Đã copy danh sách toàn bộ link!', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TelegramIcon sx={{ mr: 1, color: '#0088cc' }} /> Telegram Invite Link Gen (Dual Link)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Tạo 2 link mời (_1, _2) cho mỗi user để tracking IB/Affiliate
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bot Token"
                placeholder="123456789:ABCDefGhI..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Chat ID (Group/Channel)"
                placeholder="-100123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Danh sách tên (Mỗi người 1 dòng)"
                placeholder="diep_tran&#10;hieu_nguyen..."
                value={nameList}
                onChange={(e) => setNameList(e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GenerateIcon />}
              onClick={() => handleGenerate(false)}
              disabled={loading}
              sx={{ borderRadius: 3, px: 4, bgcolor: '#0088cc' }}
            >
              Bắt đầu tạo
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<MockIcon />}
              onClick={() => handleGenerate(true)}
              disabled={loading}
              sx={{ borderRadius: 3 }}
            >
              Dùng Mock Data
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Grid container spacing={3}>
          {/* BẢNG CHI TIẾT (BÊN TRÁI) */}
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="800">BẢNG CHI TIẾT USER (2 LINKS/USER)</Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Link 1 (_1)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Link 2 (_2)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((res, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="700">{res.name}</Typography></TableCell>
                      {res.status === 'success' ? (
                        <>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden' }}>
                            <Typography variant="caption" color="primary" noWrap display="block">{res.links[0]?.link}</Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden' }}>
                            <Typography variant="caption" color="primary" noWrap display="block">{res.links[1]?.link}</Typography>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={2}><Typography variant="caption" color="error">{res.error}</Typography></TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* BẢNG COPY NHANH (BÊN PHẢI) */}
          <Grid item xs={12} md={4}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight="800" color="success.dark">COPY NHANH EXCEL</Typography>
                <Tooltip title="Copy 2 cột để paste Excel">
                  <Button size="small" variant="contained" color="success" startIcon={<ExcelIcon />} onClick={copyAllForExcel} sx={{ borderRadius: 2 }}>
                    Copy for Excel
                  </Button>
                </Tooltip>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Danh sách link từ trên xuống dưới:
                </Typography>
                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', maxHeight: 400, overflowY: 'auto' }}>
                  {results.filter(r => r.status === 'success').map((res, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0088cc', display: 'block' }}>{res.links[0]?.link}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0088cc', display: 'block' }}>{res.links[1]?.link}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button fullWidth variant="outlined" startIcon={<CopyIcon />} onClick={copyOnlyLinksList} sx={{ mt: 2, borderRadius: 2 }}>
                  Copy All Links List
                </Button>
              </Box>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TelegramLinkGen;