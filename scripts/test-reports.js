#!/usr/bin/env node

// Test script to verify reports endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testData = {
  email: 'admin@example.com',
  password: 'admin123'
};

async function testReportsEndpoints() {
  try {
    console.log('🚀 Testing Reports Endpoints...\n');
    
    // First, let's try to authenticate
    console.log('1. Authenticating...');
    const authResponse = await axios.post(`${BASE_URL}/auth/login`, testData);
    const token = authResponse.data.token;
    console.log('✅ Authentication successful\n');
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    // Test reports endpoints
    const endpoints = [
      '/reports/stats',
      '/reports/priority-distribution',
      '/reports/status-distribution',
      '/reports/agent-performance',
      '/reports/sla-compliance'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`2. Testing ${endpoint}...`);
        const response = await axios.get(`${BASE_URL}${endpoint}`, config);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}\n`);
      }
    }
    
    // Test trends endpoint with date range
    try {
      console.log('3. Testing trends endpoint...');
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const trendsResponse = await axios.get(`${BASE_URL}/reports/trends`, {
        ...config,
        params: { startDate, endDate }
      });
      
      console.log(`✅ Trends endpoint - Status: ${trendsResponse.status}`);
      console.log(`   Response: ${JSON.stringify(trendsResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Trends endpoint - Error: ${error.message}\n`);
    }
    
    console.log('🎉 Reports endpoints testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Only run if not in test environment (script is for testing endpoints, not unit tests)
if (process.env.NODE_ENV !== 'test') {
  testReportsEndpoints();
}

module.exports = testReportsEndpoints;