import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3001';

const ThreadsOAuth = () => {
  const [clientId, setClientId] = useState('1291926866368063');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      const data = await response.json();
      if (data.clientId) {
        setClientId(data.clientId);
        localStorage.setItem('threads_client_id', data.clientId);
      }
    } catch (error) {
      const savedId = localStorage.getItem('threads_client_id');
      if (savedId) setClientId(savedId);
    }
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    localStorage.setItem('threads_client_id', clientId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      if (response.ok) {
        showSnackbar('Đã lưu Client ID thành công!', 'success');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      showSnackbar('Đã lưu vào Trình duyệt (Server đang offline)', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const oauthUrl = `https://threads.net/oauth/authorize?client_id=${clientId || '1291926866368063'}&redirect_uri=https://unicorntradingcrypto.com/&scope=threads_basic,threads_content_publish,threads_manage_replies,threads_delete,threads_profile_discovery,threads_read_replies&response_type=code`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(oauthUrl);
    showSnackbar('Đã sao chép Link OAuth!', 'success');
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="800" gutterBottom>
              Threads OAuth Generator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo link ủy quyền cho Threads API với Client ID được lưu trữ bền vững.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" fontWeight="700" gutterBottom color="primary">
                1. Nhập Client ID
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Ví dụ: 1291926866368063"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleUpdateConfig}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Update
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="700" gutterBottom color="primary">
                2. OAuth Authorization Link
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(25, 118, 210, 0.04)', 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: 'primary.light',
                  mt: 1
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" fontWeight="800" color="primary.main">GENERATED URL</Typography>
                  <Button 
                    size="small" 
                    startIcon={<CopyIcon />} 
                    onClick={copyToClipboard}
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                  >
                    Copy Link
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.6 }}>
                  {oauthUrl}
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </CardContent>
      </Card>

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

export default ThreadsOAuth;
