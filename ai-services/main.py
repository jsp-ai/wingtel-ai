from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Wingtel AI Services",
    description="AI-powered MVNO platform services with BeQuick integration capabilities",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for BeQuick-style data
class Subscriber(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    status: str
    account: str
    company: str
    balance: float
    plan: str
    device: Optional[str] = None
    imei: Optional[str] = None
    iccid: Optional[str] = None
    carrier: Optional[str] = None
    last_activity: Optional[str] = None

class ActivityItem(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: str
    user: str
    line_id: Optional[str] = None
    external_line: Optional[str] = None
    status: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AIInsight(BaseModel):
    type: str
    confidence: float
    message: str
    recommendation: str
    priority: str
    impact: Optional[str] = None
    potential_revenue: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    response: str
    insights: List[AIInsight]
    recommendations: List[str]
    data: Optional[Dict[str, Any]] = None

# Sample data mimicking BeQuick platform
SAMPLE_SUBSCRIBERS = [
    {
        "id": "SUB-25627",
        "name": "Joshua Freund",
        "phone": "(000) 000-0000", 
        "email": "joshua.freund@email.com",
        "status": "pending",
        "account": "7402",
        "company": "B2B",
        "balance": 0.00,
        "plan": "TSP 1GB Plan",
        "device": "KYO Kyocera Cadence LTE",
        "imei": "014864008685698",
        "iccid": "89148000009721577155",
        "carrier": "TellSpire",
        "last_activity": "Today at 5:12 AM PST"
    }
]

SAMPLE_ACTIVITIES = [
    {
        "id": "ACT-1",
        "type": "line_updated",
        "title": "Line Updated",
        "description": "External line number updated",
        "timestamp": "Today at 5:12:54 AM PST",
        "user": "API USER",
        "line_id": "25627",
        "external_line": "17810140",
        "status": "info"
    },
    {
        "id": "ACT-2", 
        "type": "status_changed",
        "title": "Line Updated",
        "description": "Status changed from ready-for-activation to activating",
        "timestamp": "Today at 5:12:52 AM PST",
        "user": "API USER",
        "line_id": "25627",
        "status": "warning",
        "details": {
            "old_status": "ready-for-activation",
            "new_status": "activating"
        }
    },
    {
        "id": "ACT-3",
        "type": "device_updated", 
        "title": "Line Updated",
        "description": "Device model updated to KYO Kyocera Cadence LTE",
        "timestamp": "Today at 5:12:52 AM PST",
        "user": "API USER",
        "line_id": "25627",
        "status": "info",
        "details": {
            "device_model": "KYO Kyocera Cadence LTE",
            "cdma_less_device": True
        }
    }
]

@app.get("/")
async def root():
    return {
        "message": "Wingtel AI Services - BeQuick Enhanced Platform",
        "version": "1.0.0",
        "features": [
            "Natural Language Query Processing",
            "Churn Prediction",
            "Revenue Optimization", 
            "Usage Anomaly Detection",
            "Proactive Support",
            "BeQuick Integration"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/subscribers", response_model=List[Subscriber])
async def get_subscribers():
    """Get all subscribers (BeQuick-style)"""
    return SAMPLE_SUBSCRIBERS

@app.get("/subscribers/{subscriber_id}", response_model=Subscriber)
async def get_subscriber(subscriber_id: str):
    """Get specific subscriber details"""
    subscriber = next((s for s in SAMPLE_SUBSCRIBERS if s["id"] == subscriber_id), None)
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return subscriber

@app.get("/activity", response_model=List[ActivityItem])
async def get_recent_activity():
    """Get recent activity feed (BeQuick-style)"""
    return SAMPLE_ACTIVITIES

@app.post("/ai/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process natural language queries about MVNO operations"""
    query = request.query.lower()
    
    # Simple keyword-based AI simulation
    insights = []
    recommendations = []
    response = ""
    data = {}
    
    if "port failure" in query or "port issue" in query:
        insights.append(AIInsight(
            type="support_needed",
            confidence=0.95,
            message="Port failure detected - immediate intervention required",
            recommendation="Contact carrier to resolve porting issue",
            priority="high",
            impact="High churn risk if not resolved within 24 hours"
        ))
        response = "🚨 Critical Issue Detected: Port failure for line 25627 requires immediate attention. Carrier TellSpire should be contacted to resolve the porting issue for Joshua Freund's account."
        
    elif "churn" in query or "retention" in query:
        insights.append(AIInsight(
            type="churn_risk",
            confidence=0.78,
            message="Pending status for extended period increases churn risk",
            recommendation="Expedite activation process",
            priority="medium"
        ))
        response = "📊 Churn Analysis: 1 subscriber at medium risk. Joshua Freund's prolonged pending status suggests activation delays that could lead to customer dissatisfaction."
        
    elif "revenue" in query or "upgrade" in query:
        insights.append(AIInsight(
            type="upgrade_opportunity",
            confidence=0.82,
            message="Customer shows signs of higher usage potential",
            recommendation="Suggest premium plan upgrade",
            priority="medium",
            potential_revenue="$15/month additional"
        ))
        response = "💰 Revenue Opportunity: Customer analysis suggests upgrade potential worth $15/month. Consider offering premium plans to qualified subscribers."
        
    elif "usage" in query or "anomaly" in query:
        insights.append(AIInsight(
            type="usage_anomaly",
            confidence=0.67,
            message="Unusual data usage patterns detected",
            recommendation="Monitor for potential device issues",
            priority="low"
        ))
        response = "📱 Usage Analysis: Some anomalous patterns detected. Recommend monitoring for device performance issues or unauthorized usage."
        
    else:
        response = f"I can help you analyze: Churn Risk, Revenue Optimization, Port Issues, Usage Anomalies, and Subscriber Management. Current focus: {len(SAMPLE_SUBSCRIBERS)} subscribers, {len(SAMPLE_ACTIVITIES)} recent activities."
        
        # General dashboard insights
        insights.extend([
            AIInsight(
                type="support_needed",
                confidence=0.95,
                message="Port failure detected for subscriber 25627",
                recommendation="Immediate carrier intervention required",
                priority="high"
            ),
            AIInsight(
                type="upgrade_opportunity", 
                confidence=0.82,
                message="Revenue optimization potential identified",
                recommendation="Target B2B customers for plan upgrades",
                priority="medium",
                potential_revenue="$2,400/month"
            )
        ])
    
    recommendations = [insight.recommendation for insight in insights]
    
    data = {
        "total_subscribers": len(SAMPLE_SUBSCRIBERS),
        "pending_activations": 1,
        "port_failures": 1,
        "revenue_opportunities": "$2,400/month",
        "high_priority_issues": len([i for i in insights if i.priority == "high"])
    }
    
    return QueryResponse(
        response=response,
        insights=insights,
        recommendations=recommendations,
        data=data
    )

@app.get("/ai/insights", response_model=List[AIInsight])
async def get_ai_insights():
    """Get current AI insights for the platform"""
    return [
        AIInsight(
            type="support_needed",
            confidence=0.95,
            message="Port failure detected - immediate intervention required",
            recommendation="Contact carrier to resolve porting issue",
            priority="high",
            impact="High churn risk if not resolved within 24 hours"
        ),
        AIInsight(
            type="churn_risk",
            confidence=0.78,
            message="Pending status for extended period increases churn risk", 
            recommendation="Expedite activation process",
            priority="medium"
        ),
        AIInsight(
            type="upgrade_opportunity",
            confidence=0.82,
            message="Customer shows signs of higher usage potential",
            recommendation="Suggest premium plan upgrade",
            priority="medium",
            potential_revenue="$15/month additional"
        )
    ]

@app.get("/ai/scenarios")
async def get_demo_scenarios():
    """Get demo scenarios for AI capabilities"""
    return {
        "scenarios": [
            {
                "name": "Churn Prediction",
                "description": "Identify customers at risk of leaving",
                "query": "Show me churn risk analysis"
            },
            {
                "name": "Revenue Optimization", 
                "description": "Find upgrade and upsell opportunities",
                "query": "What revenue opportunities exist?"
            },
            {
                "name": "Port Issue Resolution",
                "description": "Detect and resolve porting problems",
                "query": "Are there any port failures?"
            },
            {
                "name": "Usage Anomaly Detection",
                "description": "Identify unusual usage patterns",
                "query": "Check for usage anomalies"
            },
            {
                "name": "Proactive Support",
                "description": "Anticipate customer needs",
                "query": "What support issues need attention?"
            }
        ]
    }

# BeQuick Integration Endpoints
@app.get("/bequick/sync")
async def sync_with_bequick():
    """Simulate sync with BeQuick platform"""
    return {
        "status": "synced",
        "last_sync": datetime.now().isoformat(),
        "records_updated": len(SAMPLE_SUBSCRIBERS),
        "activities_imported": len(SAMPLE_ACTIVITIES)
    }

@app.get("/bequick/migrate")
async def migrate_from_bequick():
    """Simulate data migration from BeQuick"""
    return {
        "status": "migration_complete",
        "migrated_subscribers": len(SAMPLE_SUBSCRIBERS),
        "migrated_activities": len(SAMPLE_ACTIVITIES),
        "ai_insights_generated": 3,
        "recommendations": [
            "Review pending activations",
            "Address port failures immediately", 
            "Identify revenue opportunities"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 