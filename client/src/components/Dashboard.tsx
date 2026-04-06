import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CardActionArea,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Refresh as ProxyIcon,
  Code as CodeIcon,
  Transform as Base64Icon,
  Security as HashIcon,
  ChevronRight as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const tools = [
  {
    id: 'proxy-switcher',
    title: 'Proxy Switcher',
    description: 'Rotate and manage your residential proxy IPs from proxyxoay.shop',
    icon: <ProxyIcon />,
    color: '#1976d2',
    path: '/proxy-switcher',
    status: 'Ready'
  },
  {
    id: 'account-manager',
    title: 'Account Manager',
    description: 'Upload and manage your accounts from text files (User|Pass|2FA|Cookie).',
    icon: <CodeIcon />,
    color: '#2e7d32',
    path: '/account-manager',
    status: 'Ready'
  },
  {
    id: 'threads-oauth',
    title: 'Threads OAuth',
    description: 'Generate and manage authorization links for Threads API with persistent Client ID.',
    icon: <HashIcon />,
    color: '#000000',
    path: '/threads-oauth',
    status: 'Ready'
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Prettify, validate, and minify your JSON data with one click.',
    icon: <CodeIcon />,
    color: '#388e3c',
    path: '/json-formatter',
    status: 'Coming Soon'
  },
  {
    id: 'base64-tool',
    title: 'Base64 Encoder',
    description: 'Quickly encode or decode text and files to Base64 format.',
    icon: <Base64Icon />,
    color: '#f57c00',
    path: '/base64',
    status: 'Coming Soon'
  },
  {
    id: 'hash-generator',
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, and SHA-256 hashes for any text string.',
    icon: <HashIcon />,
    color: '#7b1fa2',
    path: '/hash',
    status: 'Coming Soon'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {tools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%', 
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                  borderColor: tool.color,
                }
              }}
            >
              <CardActionArea 
                onClick={() => tool.status === 'Ready' && navigate(tool.path)}
                disabled={tool.status !== 'Ready'}
                sx={{ height: '100%', p: 1 }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${tool.color}15`, 
                        color: tool.color, 
                        width: 56, 
                        height: 56,
                        borderRadius: 3
                      }}
                    >
                      {tool.icon}
                    </Avatar>
                    <Chip 
                      label={tool.status} 
                      size="small" 
                      color={tool.status === 'Ready' ? 'success' : 'default'}
                      variant={tool.status === 'Ready' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </Box>
                  
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    {tool.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                    {tool.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: tool.status === 'Ready' ? tool.color : 'text.disabled', fontWeight: 600, fontSize: '0.875rem' }}>
                    Open Tool <ArrowIcon sx={{ ml: 0.5, fontSize: 18 }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
