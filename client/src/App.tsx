import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProxySwitcher from './components/ProxySwitcher'
import AccountManager from './components/AccountManager'
import ThreadsOAuth from './components/ThreadsOAuth'
import Dashboard from './components/Dashboard'
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Typography, 
  Container,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Construction as ToolIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f8fafc',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    }
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <ToolIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1, letterSpacing: -0.5, fontWeight: 800 }}>
                Toolbox
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />

            {!isHome && (
              <Button 
                startIcon={<BackIcon />} 
                onClick={() => navigate('/')}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Back to Dashboard
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        {!isHome && (
          <Breadcrumbs sx={{ mb: 3 }}>
            <MuiLink 
              underline="hover" 
              color="inherit" 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
              onClick={() => navigate('/')}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </MuiLink>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {location.pathname.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Typography>
          </Breadcrumbs>
        )}

        {isHome && (
          <Box sx={{ mb: 6, textAlign: 'center', pt: 4 }}>
            <Typography variant="h4" color="text.primary" gutterBottom>
              Your Local Toolbelt
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              A collection of powerful utilities for developers. Fast, private, and always available on your machine.
            </Typography>
          </Box>
        )}
        
        <main>
          {children}
        </main>
      </Container>
      
      <Box component="footer" sx={{ py: 4, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} Toolbox Project • Secure & Private Tools
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/proxy-switcher" element={<ProxySwitcher />} />
            <Route path="/account-manager" element={<AccountManager />} />
            <Route path="/threads-oauth" element={<ThreadsOAuth />} />
            {/* Future tools can be added here */}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
