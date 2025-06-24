import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Phone,
  Warning,
  CheckCircle,
  Error,
  AccountCircle,
  CreditCard,
  LocationOn,
  Security,
  Visibility,
  Edit,
  TrendingUp,
  Psychology,
  Analytics
} from '@mui/icons-material';

interface Subscriber {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'suspended' | 'cancelled';
  account: string;
  company: string;
  balance: number;
  activeLines: number;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  lines: Line[];
  recentOrders: Order[];
  aiInsights?: AIInsight[];
}

interface Line {
  id: string;
  number: string;
  status: 'active' | 'port_failure' | 'pending' | 'suspended';
  carrier: string;
  device: string;
  imei: string;
  iccid: string;
  plan: string;
  lastActivity: string;
}

interface Order {
  id: string;
  plan: string;
  status: 'processing' | 'completed' | 'pending';
  date: string;
  amount: number;
}

interface AIInsight {
  type: 'churn_risk' | 'upgrade_opportunity' | 'usage_anomaly' | 'support_needed';
  score: number;
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

// Sample data based on BeQuick interface
const sampleSubscriber: Subscriber = {
  id: 'SUB-25627',
  name: 'Joshua Freund',
  status: 'pending',
  account: '7402',
  company: 'B2B',
  balance: 0.00,
  activeLines: 0,
  phone: '(000) 000-0000',
  email: 'joshua.freund@email.com',
  address: {
    street: '109 East Harvard St',
    city: 'Lakewood',
    state: 'NJ',
    zip: '08701-2048'
  },
  lines: [
    {
      id: 'LINE-25627',
      number: '(000) 000-0000',
      status: 'port_failure',
      carrier: 'TellSpire',
      device: 'KYO Kyocera Cadence LTE',
      imei: '014864008685698',
      iccid: '89148000009721577155',
      plan: 'TSP 1GB Plan',
      lastActivity: 'Today at 5:12 AM PST'
    }
  ],
  recentOrders: [
    {
      id: 'ORD-13305',
      plan: 'TSP 1GB Plan',
      status: 'processing',
      date: 'Today at 5:12 AM PST',
      amount: 25.00
    }
  ],
  aiInsights: [
    {
      type: 'support_needed',
      score: 0.95,
      message: 'Port failure detected - immediate intervention required',
      action: 'Contact carrier to resolve porting issue',
      priority: 'high'
    },
    {
      type: 'churn_risk',
      score: 0.78,
      message: 'Pending status for extended period increases churn risk',
      action: 'Expedite activation process',
      priority: 'medium'
    }
  ]
};

const SubscriberDashboard: React.FC = () => {
  const [subscriber, setSubscriber] = useState<Subscriber>(sampleSubscriber);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'port_failure': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'port_failure': return <Error />;
      default: return <Warning />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
          <Person />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {subscriber.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Chip
              icon={getStatusIcon(subscriber.status)}
              label={subscriber.status.toUpperCase()}
              color={getStatusColor(subscriber.status) as any}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              ACCOUNT {subscriber.account} • COMPANY {subscriber.company} • 
              SUBSCRIBER SINCE - • BALANCE ${subscriber.balance.toFixed(2)} • 
              ACTIVE LINES {subscriber.activeLines}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* AI Insights Panel */}
        {subscriber.aiInsights && subscriber.aiInsights.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', border: '1px solid rgba(25, 118, 210, 0.3)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    🤖 AI Insights & Recommendations
                  </Typography>
                </Box>
                {subscriber.aiInsights.map((insight, index) => (
                  <Alert 
                    key={index}
                    severity={getPriorityColor(insight.priority) as any}
                    sx={{ mb: 1 }}
                    action={
                      <Button color="inherit" size="small">
                        {insight.action}
                      </Button>
                    }
                  >
                    <strong>{insight.message}</strong> (Confidence: {(insight.score * 100).toFixed(0)}%)
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Lines Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">LINES</Typography>
                <Button variant="outlined" size="small">VIEW ALL</Button>
              </Box>
              
              {subscriber.lines.map((line) => (
                <Card key={line.id} sx={{ mb: 2, border: line.status === 'port_failure' ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{line.number}</Typography>
                        <Chip
                          label={line.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(line.status) as any}
                          size="small"
                          sx={{ mt: 1, mb: 2 }}
                        />
                        
                        <List dense>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">CARRIER</Typography>}
                              secondary={<Typography variant="body1">{line.carrier}</Typography>}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">WIRELESS PORT IN</Typography>}
                              secondary={<Typography variant="body1">{line.number.replace(/[()]/g, '').replace(/ /g, '-')}</Typography>}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">MAKE/MODEL</Typography>}
                              secondary={<Typography variant="body1">{line.device}</Typography>}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">IMEI</Typography>}
                              secondary={<Typography variant="body1">{line.imei}</Typography>}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">ICCID</Typography>}
                              secondary={<Typography variant="body1">{line.iccid}</Typography>}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">SIM TYPE</Typography>}
                              secondary={<Typography variant="body1">SIM Card</Typography>}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">CREATED</Typography>}
                              secondary={<Typography variant="body1">{line.lastActivity}</Typography>}
                            />
                          </ListItem>
                        </List>
                      </Box>
                      <Button variant="contained" color="primary" size="small">
                        VIEW LINE
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">RECENT ORDERS</Typography>
                <Button variant="outlined" size="small">VIEW ALL</Button>
              </Box>
              
              {subscriber.recentOrders.map((order) => (
                <Card key={order.id} sx={{ mb: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">Order #{order.id}</Typography>
                        <Chip
                          label={order.status.toUpperCase()}
                          color="warning"
                          size="small"
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <Typography variant="body1" fontWeight="bold">{order.plan}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          UPDATED {order.date}
                        </Typography>
                      </Box>
                      <Button variant="contained" color="warning" size="small">
                        VIEW ORDER
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add New Order Button */}
              <Card sx={{ border: '2px dashed #ccc', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>+</Typography>
                  <Typography variant="body1" color="text.secondary">ADD NEW ORDER</Typography>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </Grid>

        {/* Billing & Account Information */}
        <Grid item xs={12} md={4}>
          {/* Billing Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>BILLING SUMMARY</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">AUTOPAY</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Not Enrolled</Typography>
                  <Button variant="outlined" size="small">MANAGE</Button>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">NEW CHARGES</Typography>
                <Typography variant="h6">${subscriber.balance.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">PAST DUE</Typography>
                <Typography variant="h6">${subscriber.balance.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body1" fontWeight="bold">BALANCE</Typography>
                <Typography variant="h5" color="primary">${subscriber.balance.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>ACCOUNT INFORMATION</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">PRIMARY PAYMENT METHOD</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>None Selected</Typography>
                  <Button variant="outlined" size="small">ADD CARD</Button>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">PRIMARY ADDRESS</Typography>
                <Typography variant="body1">{subscriber.name}</Typography>
                <Typography variant="body2">
                  {subscriber.address.street}<br/>
                  {subscriber.address.city}, {subscriber.address.state} {subscriber.address.zip}<br/>
                  United States
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>CHECK COVERAGE</Button>
                  <Button variant="outlined" size="small">CHANGE ADDRESS</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">ACCOUNT SECURITY</Typography>
                <Button variant="contained" size="small">EDIT</Button>
              </Box>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No security questions configured.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriberDashboard; 