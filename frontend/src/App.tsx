import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Badge,
  IconButton,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Psychology,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Phone,
  Person,
  Analytics,
  Search,
  Notifications,
  Settings,
  Refresh,
  AccountCircle
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BeQuickStyleDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [subscribers] = useState([
    {
      id: 'SUB-25627',
      name: 'Joshua Freund',
      phone: '(000) 000-0000',
      status: 'pending',
      account: '7402',
      company: 'B2B',
      balance: 0.00,
      plan: 'TSP 1GB Plan',
      device: 'KYO Kyocera Cadence LTE',
      carrier: 'TellSpire',
      lastActivity: 'Today at 5:12 AM PST'
    }
  ]);

  const [activities] = useState([
    {
      id: 'ACT-1',
      type: 'line_updated',
      title: 'Line Updated',
      description: 'External line number updated',
      timestamp: 'Today at 5:12:54 AM PST',
      user: 'API USER',
      lineId: '25627',
      externalLine: '17810140',
      status: 'info'
    },
    {
      id: 'ACT-2',
      type: 'status_changed', 
      title: 'Line Updated',
      description: 'Status changed from ready-for-activation to activating',
      timestamp: 'Today at 5:12:52 AM PST',
      user: 'API USER',
      lineId: '25627',
      status: 'warning'
    },
    {
      id: 'ACT-3',
      type: 'port_failure',
      title: '🤖 AI Alert: Port Failure Detected',
      description: 'Critical issue requires immediate attention',
      timestamp: 'Today at 5:13:00 AM PST',
      user: 'WINGTEL AI',
      lineId: '25627',
      status: 'error'
    }
  ]);

  const [aiInsights] = useState([
    {
      type: 'support_needed',
      confidence: 0.95,
      message: 'Port failure detected - immediate intervention required',
      recommendation: 'Contact carrier to resolve porting issue',
      priority: 'high',
      impact: 'High churn risk if not resolved within 24 hours'
    },
    {
      type: 'churn_risk',
      confidence: 0.78,
      message: 'Pending status for extended period increases churn risk',
      recommendation: 'Expedite activation process',
      priority: 'medium'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'port_failure': case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color="success" />;
      case 'pending': return <Warning color="warning" />;
      case 'port_failure': case 'error': return <Error color="error" />;
      default: return <Warning />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🚀 Wingtel AI - MVNO Platform
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={2} color="error">
              <Notifications />
            </Badge>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <AccountCircle />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<Person />} label="Subscribers" />
          <Tab icon={<Refresh />} label="Activity" />
          <Tab icon={<Psychology />} label="AI Insights" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Dashboard */}
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* AI Insights Banner */}
            <Grid item xs={12}>
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small">
                    RESOLVE NOW
                  </Button>
                }
              >
                <strong>🤖 AI Alert:</strong> Port failure detected for subscriber 25627 - immediate intervention required (95% confidence)
              </Alert>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Subscribers
                  </Typography>
                  <Typography variant="h4">
                    247
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    ↗ +5 this week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Revenue Opportunity
                  </Typography>
                  <Typography variant="h4" color="primary">
                    $2,400
                  </Typography>
                  <Typography variant="body2">
                    Monthly potential
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Churn Risk
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    12
                  </Typography>
                  <Typography variant="body2">
                    High-risk subscribers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Port Failures
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    1
                  </Typography>
                  <Typography variant="body2">
                    Requires attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity Preview */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Recent Activity</Typography>
                    <Button variant="outlined" size="small">VIEW ALL</Button>
                  </Box>
                  <List>
                    {activities.slice(0, 3).map((activity) => (
                      <ListItem key={activity.id} sx={{ borderLeft: `4px solid ${activity.status === 'error' ? '#f44336' : activity.status === 'warning' ? '#ff9800' : '#2196f3'}` }}>
                        <ListItemIcon>
                          {getStatusIcon(activity.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <>
                              {activity.description}<br/>
                              <Typography variant="caption" color="text.secondary">
                                {activity.timestamp} • {activity.user}
                              </Typography>
                            </>
                          }
                        />
                        <Button variant="contained" size="small">VIEW</Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Insights Panel */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', border: '1px solid rgba(25, 118, 210, 0.3)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">
                      🤖 AI Insights
                    </Typography>
                  </Box>
                                     {aiInsights.map((insight, index) => (
                     <Alert 
                       key={index}
                       severity={insight.priority === 'high' ? 'error' : 'warning'}
                       sx={{ mb: 1 }}
                     >
                      <Typography variant="body2">
                        <strong>{insight.message}</strong><br/>
                        Confidence: {(insight.confidence * 100).toFixed(0)}%
                      </Typography>
                    </Alert>
                  ))}
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    VIEW ALL INSIGHTS
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Subscribers Tab - BeQuick Style */}
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Subscribers</Typography>
            <TextField
              placeholder="Search subscribers..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {subscribers.map((subscriber) => (
            <Card key={subscriber.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5">{subscriber.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Chip
                        icon={getStatusIcon(subscriber.status)}
                        label={subscriber.status.toUpperCase()}
                        color={getStatusColor(subscriber.status) as any}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        ACCOUNT {subscriber.account} • COMPANY {subscriber.company} • BALANCE ${subscriber.balance.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" color="primary">
                    VIEW DETAILS
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">PHONE</Typography>
                    <Typography variant="body1">{subscriber.phone}</Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>PLAN</Typography>
                    <Typography variant="body1">{subscriber.plan}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">DEVICE</Typography>
                    <Typography variant="body1">{subscriber.device}</Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>CARRIER</Typography>
                    <Typography variant="body1">{subscriber.carrier}</Typography>
                  </Grid>
                </Grid>

                {/* AI Insights for this subscriber */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" color="error" fontWeight="bold">
                    🤖 AI Alert: Port failure detected - immediate intervention required
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Container>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Activity Feed Tab */}
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 3 }}>Recent Activity</Typography>
          
          <Card>
            <CardContent>
              <List>
                {activities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: activity.user === 'WINGTEL AI' ? 'secondary.main' : 'primary.main',
                            width: 32,
                            height: 32
                          }}
                        >
                          {activity.user === 'WINGTEL AI' ? '🤖' : <Phone />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{activity.title}</Typography>
                            <Button variant="contained" size="small">VIEW LINE</Button>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {activity.lineId && activity.externalLine && (
                              <Typography variant="body2">
                                <strong>ID:</strong> {activity.lineId} • <strong>External Line:</strong> {activity.externalLine}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {activity.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {activity.timestamp} • {activity.user}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* AI Insights Tab */}
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 3 }}>🤖 AI Insights & Recommendations</Typography>
          
          <Grid container spacing={3}>
            {aiInsights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ bgcolor: insight.priority === 'high' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Psychology sx={{ mr: 1, color: insight.priority === 'high' ? 'error.main' : 'warning.main' }} />
                      <Chip 
                        label={insight.type.replace('_', ' ').toUpperCase()}
                        color={insight.priority === 'high' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {insight.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </Typography>
                    {insight.impact && (
                      <Typography variant="body2" color="error">
                        <strong>Impact:</strong> {insight.impact}
                      </Typography>
                    )}
                    <Button 
                      variant="contained" 
                      color={insight.priority === 'high' ? 'error' : 'warning'}
                      sx={{ mt: 2 }}
                    >
                      TAKE ACTION
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </TabPanel>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BeQuickStyleDashboard />
    </ThemeProvider>
  );
}

export default App; 