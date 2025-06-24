import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Avatar,
  Badge,
  Divider,
  IconButton
} from '@mui/material';
import {
  Phone,
  Update,
  Error,
  CheckCircle,
  Warning,
  Psychology,
  Visibility,
  Refresh,
  FilterList
} from '@mui/icons-material';

interface ActivityItem {
  id: string;
  type: 'line_updated' | 'status_changed' | 'device_updated' | 'order_created' | 'ai_insight';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  details?: Record<string, any>;
  status?: 'info' | 'warning' | 'error' | 'success';
  lineId?: string;
  externalLine?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Sample activity data based on BeQuick interface
const sampleActivities: ActivityItem[] = [
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
    status: 'warning',
    details: {
      oldStatus: 'ready-for-activation',
      newStatus: 'activating',
      statusChanged: 'Today at 5:12 AM PST'
    }
  },
  {
    id: 'ACT-3',
    type: 'device_updated',
    title: 'Line Updated',
    description: 'Device model updated to KYO Kyocera Cadence LTE',
    timestamp: 'Today at 5:12:52 AM PST',
    user: 'API USER',
    lineId: '25627',
    status: 'info',
    details: {
      deviceModel: 'KYO Kyocera Cadence LTE',
      cdmaLessDevice: true
    }
  },
  {
    id: 'ACT-4',
    type: 'line_updated',
    title: 'Line Updated',
    description: 'Device pre-activation status updated',
    timestamp: 'Today at 5:12:51 AM PST',
    user: 'API USER',
    lineId: '25627',
    status: 'info',
    details: {
      preactivated: false
    }
  },
  {
    id: 'ACT-5',
    type: 'ai_insight',
    title: '🤖 AI Alert',
    description: 'Port failure detected - immediate intervention required',
    timestamp: 'Today at 5:13:00 AM PST',
    user: 'WINGTEL AI',
    lineId: '25627',
    status: 'error',
    priority: 'high',
    details: {
      confidence: 0.95,
      recommendation: 'Contact carrier to resolve porting issue',
      impact: 'High churn risk if not resolved within 24 hours'
    }
  },
  {
    id: 'ACT-6',
    type: 'ai_insight',
    title: '🤖 AI Recommendation',
    description: 'Upgrade opportunity identified for customer',
    timestamp: 'Today at 5:10:00 AM PST',
    user: 'WINGTEL AI',
    lineId: '25627',
    status: 'success',
    priority: 'medium',
    details: {
      confidence: 0.82,
      recommendation: 'Suggest premium plan upgrade',
      potentialRevenue: '$15/month additional'
    }
  }
];

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(sampleActivities);
  const [filter, setFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'line_updated':
        return <Update color={status === 'error' ? 'error' : 'primary'} />;
      case 'status_changed':
        return status === 'error' ? <Error color="error" /> : <Warning color="warning" />;
      case 'device_updated':
        return <Phone color="primary" />;
      case 'ai_insight':
        return <Psychology color="secondary" />;
      default:
        return <Update color="primary" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'success': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors: Record<string, 'error' | 'warning' | 'info'> = {
      high: 'error',
      medium: 'warning', 
      low: 'info'
    };

    return (
      <Chip 
        size="small" 
        label={priority.toUpperCase()} 
        color={colors[priority] || 'default'}
        sx={{ ml: 1 }}
      />
    );
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'ai') return activity.type === 'ai_insight';
    if (filter === 'errors') return activity.status === 'error';
    if (filter === 'updates') return activity.type === 'line_updated';
    return true;
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new activity
        const newActivity: ActivityItem = {
          id: `ACT-${Date.now()}`,
          type: 'line_updated',
          title: 'Line Updated',
          description: 'Real-time activity simulation',
          timestamp: new Date().toLocaleString(),
          user: 'API USER',
          status: 'info'
        };
        
        // Only add if we want to show live updates
        // setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Recent Activity
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            size="small"
          >
            All
          </Button>
          <Button
            variant={filter === 'ai' ? 'contained' : 'outlined'}
            onClick={() => setFilter('ai')}
            size="small"
            color="secondary"
          >
            🤖 AI Insights
          </Button>
          <Button
            variant={filter === 'errors' ? 'contained' : 'outlined'}
            onClick={() => setFilter('errors')}
            size="small"
            color="error"
          >
            Errors
          </Button>
          <Button
            variant={filter === 'updates' ? 'contained' : 'outlined'}
            onClick={() => setFilter('updates')}
            size="small"
          >
            Updates
          </Button>
          <Button variant="contained" size="small" color="primary">
            VIEW ALL ACTIVITY
          </Button>
        </Box>
      </Box>

      {/* Activity Timeline */}
      <Card>
        <CardContent>
          <Box sx={{ position: 'relative' }}>
            {/* Timeline line */}
            <Box 
              sx={{ 
                position: 'absolute',
                left: 24,
                top: 0,
                bottom: 0,
                width: 2,
                bgcolor: 'divider'
              }}
            />
            
            <List>
              {filteredActivities.map((activity, index) => (
                <ListItem key={activity.id} sx={{ mb: 2, position: 'relative' }}>
                  {/* Timeline dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 15,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(activity.status),
                      border: '3px solid white',
                      boxShadow: 1,
                      zIndex: 1
                    }}
                  />
                  
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: activity.type === 'ai_insight' ? 'secondary.main' : 'primary.main',
                        width: 32,
                        height: 32
                      }}
                    >
                      {activity.type === 'ai_insight' ? '🤖' : getActivityIcon(activity.type, activity.status)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    sx={{ ml: 1 }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" component="span">
                            {activity.title}
                          </Typography>
                          {getPriorityBadge(activity.priority)}
                        </Box>
                        <Button variant="contained" size="small" color="primary">
                          VIEW LINE
                        </Button>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {activity.lineId && activity.externalLine && (
                          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                            <strong>ID:</strong> {activity.lineId}<br/>
                            <strong>External Line:</strong> {activity.externalLine}
                          </Typography>
                        )}
                        
                        {activity.details && (
                          <Box sx={{ mb: 1 }}>
                            {activity.details.oldStatus && activity.details.newStatus && (
                              <Typography variant="body2" component="div">
                                <strong>Status:</strong> 
                                <Chip 
                                  size="small" 
                                  label={activity.details.oldStatus}
                                  sx={{ mx: 0.5 }}
                                />
                                → 
                                <Chip 
                                  size="small" 
                                  label={activity.details.newStatus}
                                  color="warning"
                                  sx={{ mx: 0.5 }}
                                />
                                <br/>
                                <strong>Status Changed:</strong> {activity.details.statusChanged}
                              </Typography>
                            )}
                            
                            {activity.details.deviceModel && (
                              <Typography variant="body2" component="div">
                                <strong>Device Model:</strong> {activity.details.deviceModel}<br/>
                                <strong>Details:</strong> {JSON.stringify({ 
                                  cdma_less_device: activity.details.cdmaLessDevice?.toString() 
                                })}
                              </Typography>
                            )}
                            
                            {activity.details.preactivated !== undefined && (
                              <Typography variant="body2" component="div">
                                <strong>Details:</strong> {JSON.stringify({ 
                                  preactivated: activity.details.preactivated.toString() 
                                })}
                              </Typography>
                            )}

                            {activity.details.confidence && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>AI Confidence:</strong> {(activity.details.confidence * 100).toFixed(0)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Recommendation:</strong> {activity.details.recommendation}
                                </Typography>
                                {activity.details.impact && (
                                  <Typography variant="body2" color="error">
                                    <strong>Business Impact:</strong> {activity.details.impact}
                                  </Typography>
                                )}
                                {activity.details.potentialRevenue && (
                                  <Typography variant="body2" color="success.main">
                                    <strong>Revenue Opportunity:</strong> {activity.details.potentialRevenue}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
                        
                        <Typography variant="body2" color="text.secondary">
                          {activity.timestamp}<br/>
                          {activity.user}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>

      {/* Real-time indicator */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Badge color="success" variant="dot" sx={{ mr: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Live updates enabled
          </Typography>
        </Badge>
        <IconButton 
          size="small" 
          onClick={() => setAutoRefresh(!autoRefresh)}
          color={autoRefresh ? 'primary' : 'default'}
        >
          <Refresh />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ActivityFeed; 