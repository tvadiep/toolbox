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
  Slider,
  Stack,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Collections as GalleryIcon,
  CloudDownload as BatchDownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ImageScraper = () => {
  const [query, setQuery] = useState('');
  const [maxImagesInput, setMaxImagesInput] = useState('20');
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleScrape = async () => {
    const maxImages = parseInt(maxImagesInput) || 10;
    console.log('>>> [FRONTEND] Starting scrape request for:', query, 'count:', maxImages);
    if (!query.trim()) {
      showSnackbar('Vui lòng nhập từ khóa tìm kiếm!', 'error');
      return;
    }

    setLoading(true);
    setImages([]);
    setSelectedIndices([]);
    try {
      const response = await axios.post('http://localhost:3001/api/scrape-images', {
        query,
        maxImages,
      }, { timeout: 60000 });
      
      const foundImages = response.data.images;
      setImages(foundImages);
      // Tự động chọn tất cả sau khi tìm xong
      setSelectedIndices(foundImages.map((_: any, i: number) => i));
      
      if (foundImages.length === 0) {
        showSnackbar('Không tìm thấy ảnh nào. Hãy thử từ khóa khác!', 'error');
      } else {
        showSnackbar(`Đã tìm thấy ${foundImages.length} ảnh!`, 'success');
      }
    } catch (error: any) {
      console.error('>>> [FRONTEND] Error detail:', error);
      showSnackbar('Lỗi: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === images.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(images.map((_, i) => i));
    }
  };
const downloadImage = async (url: string, index: number) => {
  const fileName = `anhso${index + 1}.jpg`;
  try {
    // Dùng proxy của backend để tránh lỗi CORS
    const proxyUrl = `http://localhost:3001/api/download-proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    // Fallback cuối cùng nếu proxy cũng lỗi
    window.open(url, '_blank');
  }
};

  const downloadSelected = async () => {
    if (selectedIndices.length === 0) return;
    
    const count = selectedIndices.length;
    showSnackbar(`Bắt đầu tải ${count} ảnh đã chọn... (Vui lòng không tắt tab)`, 'success');
    
    // Sắp xếp để tải đúng thứ tự anhso1 -> anhsoN
    const sortedIndices = [...selectedIndices].sort((a, b) => a - b);
    
    for (let i = 0; i < sortedIndices.length; i++) {
      const index = sortedIndices[i];
      const url = images[index];
      
      try {
        // Gọi hàm download và đợi một chút để trình duyệt không bị ngợp
        await downloadImage(url, index);
        
        // Cứ mỗi ảnh nghỉ 600ms - Đây là khoảng thời gian an toàn để trình duyệt chấp nhận hàng loạt download
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (err) {
        console.error(`Lỗi khi tải ảnh số ${index + 1}:`, err);
      }
    }
    
    showSnackbar(`Đã hoàn thành tải ${count} ảnh!`, 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight="800" gutterBottom>
                Image Scraper Pro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tìm kiếm và tải ảnh hàng loạt (Nguồn: Bing Images)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Từ khóa tìm kiếm"
                    variant="outlined"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
                    placeholder="Ví dụ: Nature landscape 4k"
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                      sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Số lượng ảnh"
                    variant="outlined"
                    value={maxImagesInput}
                    onChange={(e) => setMaxImagesInput(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }} alignItems="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  onClick={handleScrape}
                  disabled={loading}
                  sx={{ borderRadius: 3, px: 4, bgcolor: 'primary.main' }}
                >
                  {loading ? 'Đang tìm ảnh...' : 'Tìm kiếm'}
                </Button>
                
                {images.length > 0 && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<BatchDownloadIcon />}
                      onClick={downloadSelected}
                      disabled={selectedIndices.length === 0}
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Tải ảnh đã chọn ({selectedIndices.length})
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={toggleSelectAll}
                      sx={{ borderRadius: 3 }}
                    >
                      {selectedIndices.length === images.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }} color="text.secondary">
            Đang cào dữ liệu từ Bing...
          </Typography>
        </Box>
      )}

      {!loading && images.length > 0 && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Grid container spacing={0.5} justifyContent="flex-start">
            {images.map((url, index) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <Grid item key={index} sx={{ width: 300 }}>
                  <Card 
                    elevation={0} 
                    onClick={() => toggleSelect(index)}
                    sx={{ 
                      borderRadius: 0, 
                      border: '1px solid', 
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      width: 300,
                      height: 325,
                      transition: 'all 0.1s',
                      bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'white',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Box sx={{ width: 300, height: 300, position: 'relative' }}>
                      <img
                        src={url}
                        alt={`anhso${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5, 
                        zIndex: 2,
                        bgcolor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.7)',
                        borderRadius: 0,
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 1,
                        color: 'white',
                        fontSize: '0.7rem',
                      }}>
                        {isSelected ? '✓' : ''}
                      </Box>
                    </Box>
                    <Box sx={{ py: 0.2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: isSelected ? 'primary.main' : 'text.secondary', lineHeight: 1.2 }}>
                        anhso{index + 1}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {!loading && images.length === 0 && !query && (
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
          <GalleryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có kết quả tìm kiếm
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Nhập từ khóa và nhấn "Bắt đầu quét" để tìm ảnh từ Google
          </Typography>
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

export default ImageScraper;