import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Chip,
  Fade,
  TextField,
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountCircle as AccountIcon,
  Key as PasswordIcon,
  Security as TwoFAIcon,
  Cookie as CookieIcon,
  Edit as EditIcon,
  AutoFixHigh as BatchIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface Account {
  id: number;
  username: string;
  password: string;
  twoFA: string;
  cookie: string;
  newUsername: string; // New field
}

const AccountManager = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchUsernames, setBatchUsernames] = useState('');
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (accounts.length === 0) {
      showSnackbar('Không có dữ liệu để xuất!', 'error');
      return;
    }

    let content = 'Tài khoản\n';
    accounts.forEach((acc) => {
      content += `${acc.username}|${acc.password}|${acc.twoFA}|${acc.cookie}\n`;
      content += `New UN: ${acc.newUsername || 'N/A'}\n\n\n`; // Two empty lines after New UN line
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exported_accounts_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('Đã xuất file thành công!', 'success');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/);
      const parsedAccounts: Account[] = [];

      lines.forEach((line) => {
        if (line.trim() === '' || line.toLowerCase().includes('tài khoản')) return;

        const parts = line.split('|');
        if (parts.length >= 3) {
          parsedAccounts.push({
            id: parsedAccounts.length + 1,
            username: parts[0]?.trim() || '',
            password: parts[1]?.trim() || '',
            twoFA: parts[2]?.trim() || '',
            cookie: parts[3]?.trim() || '',
            newUsername: '',
          });
        }
      });

      setAccounts(parsedAccounts);
      showSnackbar(`Đã tải lên thành công ${parsedAccounts.length} tài khoản!`, 'success');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyBatchUsernames = () => {
    const newNames = batchUsernames.split(/\r?\n/).filter(name => name.trim() !== '');
    if (newNames.length === 0) {
      showSnackbar('Vui lòng nhập danh sách Username mới!', 'error');
      return;
    }

    const updatedAccounts = accounts.map((acc, index) => ({
      ...acc,
      newUsername: newNames[index] || acc.newUsername
    }));

    setAccounts(updatedAccounts);
    showSnackbar(`Đã cập nhật ${Math.min(newNames.length, accounts.length)} Username mới!`, 'success');
    setShowBatchInput(false);
    setBatchUsernames('');
  };

  const updateIndividualUsername = (id: number, value: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, newUsername: value } : acc
    ));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showSnackbar(`Đã sao chép ${label}`, 'success');
  };

  const copyAllTwoFA = () => {
    const targetAccounts = filteredAccounts.length > 0 ? filteredAccounts : accounts;
    if (targetAccounts.length === 0) {
      showSnackbar('Không có tài khoản nào để copy!', 'error');
      return;
    }
    const allTwoFA = targetAccounts.map(acc => acc.twoFA).filter(code => code).join('\n');
    navigator.clipboard.writeText(allTwoFA);
    showSnackbar(`Đã sao chép ${targetAccounts.length} mã 2FA!`, 'success');
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.newUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ pb: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight="800" gutterBottom>
                Account Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý và cập nhật Username mới cho danh sách tài khoản
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1.5}>
              <input
                type="file"
                accept=".txt"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Upload File
              </Button>
              {accounts.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<TwoFAIcon />}
                    onClick={copyAllTwoFA}
                    sx={{ borderRadius: 2, px: 3, bgcolor: 'secondary.main' }}
                  >
                    Copy All 2FA
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if(window.confirm('Bạn có chắc chắn muốn xóa tất cả?')) setAccounts([]);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Xóa
                  </Button>
                </>
              )}
            </Stack>
          </Stack>

          {accounts.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm tài khoản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  sx={{ maxWidth: 400 }}
                />
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    startIcon={showBatchInput ? <ExpandLessIcon /> : <BatchIcon />}
                    onClick={() => setShowBatchInput(!showBatchInput)}
                    color="secondary"
                    sx={{ borderRadius: 2 }}
                  >
                    Batch Update Usernames
                  </Button>
                  <Chip 
                    label={`${accounts.length} tài khoản`} 
                    color="primary" 
                    variant="filled" 
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Stack>
              </Stack>

              <Collapse in={showBatchInput}>
                <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(156, 39, 176, 0.04)', borderRadius: 3, border: '1px dashed', borderColor: 'secondary.light' }}>
                  <Typography variant="subtitle2" fontWeight="700" gutterBottom color="secondary.dark">
                    Nhập danh sách Username mới (Mỗi dòng một tên)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="User_1&#10;User_2&#10;User_3..."
                    value={batchUsernames}
                    onChange={(e) => setBatchUsernames(e.target.value)}
                    variant="outlined"
                    sx={{ bgcolor: 'white', mb: 2 }}
                  />
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={applyBatchUsernames}
                    disabled={!batchUsernames.trim()}
                    startIcon={<BatchIcon />}
                  >
                    Áp dụng cho tất cả dòng (Lần lượt từ trên xuống)
                  </Button>
                </Box>
              </Collapse>
            </Box>
          )}
        </CardContent>
      </Card>

      {filteredAccounts.length > 0 ? (
        <Fade in={true}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', minWidth: 'fit-content' }}>
              <Table sx={{ minWidth: 1716, tableLayout: 'fixed' }}>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell width={60} sx={{ fontWeight: 700, px: 2 }}>STT</TableCell>
                    <TableCell width={300} sx={{ fontWeight: 700, px: 2 }}>Tài khoản Gốc</TableCell>
                    <TableCell width={216} sx={{ fontWeight: 700, bgcolor: 'rgba(46, 125, 50, 0.05)', color: 'success.dark', px: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EditIcon fontSize="small" />
                        <span>New User Name</span>
                      </Stack>
                    </TableCell>
                    <TableCell width={180} sx={{ fontWeight: 700, px: 2 }}>Mật khẩu</TableCell>
                    <TableCell width={300} sx={{ fontWeight: 700, px: 2 }}>2FA Secret</TableCell>
                    <TableCell width={660} sx={{ fontWeight: 700, px: 2 }}>Cookie</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {filteredAccounts.map((acc, index) => (
                  <TableRow key={acc.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ px: 2 }}>{index + 1}</TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccountIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="600" noWrap>{acc.username}</Typography>
                        <Tooltip title="Copy Username Gốc">
                          <IconButton size="small" onClick={() => copyToClipboard(acc.username, 'Username Gốc')}>
                            <CopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(46, 125, 50, 0.02)', px: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Nhập tên mới..."
                        value={acc.newUsername}
                        onChange={(e) => updateIndividualUsername(acc.id, e.target.value)}
                        variant="standard"
                        InputProps={{
                          disableUnderline: false,
                          sx: { fontSize: '0.875rem', fontWeight: 600, color: 'success.main' },
                          endAdornment: acc.newUsername && (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => copyToClipboard(acc.newUsername, 'New Username')}>
                                <CopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PasswordIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }} noWrap>{acc.password}</Typography>
                        <Tooltip title="Copy Password">
                          <IconButton size="small" onClick={() => copyToClipboard(acc.password, 'Password')}>
                            <CopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TwoFAIcon fontSize="small" color="action" />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            color: 'secondary.main', 
                            fontWeight: 600,
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {acc.twoFA}
                        </Typography>
                        <Tooltip title="Copy 2FA">
                          <IconButton size="small" onClick={() => copyToClipboard(acc.twoFA, '2FA Secret')}>
                            <CopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CookieIcon fontSize="small" color="action" />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            maxWidth: 500, 
                            display: 'inline-block', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            color: 'text.secondary'
                          }}
                        >
                          {acc.cookie}
                        </Typography>
                        <Tooltip title="Copy Cookie">
                          <IconButton size="small" onClick={() => copyToClipboard(acc.cookie, 'Cookie')}>
                            <CopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        </Fade>
      ) : accounts.length > 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Không tìm thấy tài khoản nào phù hợp.</Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 12, 
            bgcolor: 'white', 
            borderRadius: 4, 
            border: '2px dashed', 
            borderColor: 'divider' 
          }}
        >
          <UploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có dữ liệu tài khoản
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 4 }}>
            Vui lòng upload file .txt để bắt đầu xử lý
          </Typography>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ borderRadius: 2 }}
          >
            Chọn File ngay
          </Button>
        </Box>
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

export default AccountManager;
