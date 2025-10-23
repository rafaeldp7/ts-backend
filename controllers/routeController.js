const mongoose = require('mongoose');

/**
 * Process routes with traffic analysis
 * POST /api/routes/process-directions
 */
const processDirections = async (req, res) => {
  try {
    const startTime = Date.now();
    const { origin, destination, motorData, options = {} } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    // Simulate route processing (in real implementation, call Google Directions API)
    const routes = [
      {
        id: 'route_1',
        summary: 'Fastest route',
        distance: { value: 15000, text: '15.0 km' },
        duration: { value: 1200, text: '20 mins' },
        duration_in_traffic: { value: 1500, text: '25 mins' },
        legs: [{
          distance: { value: 15000, text: '15.0 km' },
          duration: { value: 1200, text: '20 mins' },
          duration_in_traffic: { value: 1500, text: '25 mins' },
          start_address: 'Origin Address',
          end_address: 'Destination Address'
        }],
        overview_polyline: { points: 'encoded_polyline_string' }
      }
    ];
    
    // Calculate fuel estimates for each route
    const routesWithFuel = routes.map(route => {
      const fuelConsumed = motorData ? route.distance.value / 1000 / motorData.fuelEfficiency : 0;
      return {
        ...route,
        fuelConsumed,
        fuelCost: fuelConsumed * 1.5, // Assuming $1.5 per liter
        efficiency: motorData ? motorData.fuelEfficiency : 0
      };
    });
    
    // Analyze traffic conditions
    const trafficAnalysis = {
      currentConditions: 'moderate',
      delays: routesWithFuel.map(route => ({
        routeId: route.id,
        delay: route.duration_in_traffic.value - route.duration.value,
        delayPercentage: ((route.duration_in_traffic.value - route.duration.value) / route.duration.value) * 100
      })),
      recommendations: generateTrafficRecommendations(routesWithFuel)
    };
    
    res.json({
      routes: routesWithFuel,
      mainRoute: routesWithFuel[0],
      alternatives: routesWithFuel.slice(1),
      fuelEstimates: routesWithFuel.map(route => ({
        routeId: route.id,
        fuelConsumed: route.fuelConsumed,
        fuelCost: route.fuelCost
      })),
      trafficAnalysis,
      performance: {
        routesProcessed: routesWithFuel.length,
        processingTime: Date.now() - startTime,
        apiCalls: 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process traffic analysis for routes
 * POST /api/routes/process-traffic-analysis
 */
const processTrafficAnalysis = async (req, res) => {
  try {
    const startTime = Date.now();
    const { routes, motorData, options = {} } = req.body;
    
    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({ error: 'Routes array is required' });
    }
    
    // Process each route
    const processedRoutes = routes.map((route, index) => {
      try {
        const leg = route.legs?.[0];
        if (!leg) {
          console.warn(`Route ${index} has no legs, skipping`);
          return null;
        }
        
        const fuel = motorData ? (leg.distance?.value / 1000 / motorData.fuelEfficiency) : 0;
        
        // Calculate traffic rate
        const trafficRate = getTrafficRateFromLeg(leg);
        
        // Decode polyline (simplified)
        let coordinates = [];
        try {
          if (route.overview_polyline?.points) {
            // In real implementation, decode polyline
            coordinates = [
              { latitude: 0, longitude: 0 },
              { latitude: 1, longitude: 1 }
            ];
          }
        } catch (polylineError) {
          console.warn(`Failed to decode polyline for route ${index}:`, polylineError);
          coordinates = [];
        }
        
        return {
          id: `route-${index}`,
          summary: route.summary,
          distance: leg.distance,
          duration: leg.duration,
          duration_in_traffic: leg.duration_in_traffic,
          fuel,
          trafficRate,
          coordinates,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          polyline: route.overview_polyline?.points
        };
      } catch (error) {
        console.warn(`Error processing route ${index}:`, error);
        return null;
      }
    }).filter(route => route !== null);
    
    // Analyze traffic patterns
    const trafficAnalysis = {
      averageTrafficRate: processedRoutes.reduce((sum, route) => sum + route.trafficRate, 0) / processedRoutes.length,
      worstTrafficRoute: processedRoutes.reduce((worst, route) => 
        route.trafficRate > worst.trafficRate ? route : worst, processedRoutes[0]),
      bestTrafficRoute: processedRoutes.reduce((best, route) => 
        route.trafficRate < best.trafficRate ? route : best, processedRoutes[0])
    };
    
    // Calculate fuel estimates
    const fuelEstimates = processedRoutes.map(route => ({
      routeId: route.id,
      fuelConsumed: route.fuel,
      fuelCost: route.fuel * 1.5, // Assuming $1.5 per liter
      efficiency: motorData ? motorData.fuelEfficiency : 0
    }));
    
    // Generate safety metrics
    const safetyMetrics = processedRoutes.map(route => ({
      routeId: route.id,
      safetyScore: calculateSafetyScore(route),
      riskFactors: identifyRiskFactors(route)
    }));
    
    res.json({
      routes: processedRoutes,
      trafficAnalysis,
      fuelEstimates,
      safetyMetrics,
      performance: {
        routesProcessed: processedRoutes.length,
        processingTime: Date.now() - startTime,
        polylineDecodingTime: 50 // Simulated
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process route data
 * POST /api/routes/process
 */
const processRoutes = async (req, res) => {
  try {
    const startTime = Date.now();
    const { origin, destination, options, motorData } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    
    // Simulate route fetching and processing
    const routes = await fetchAndProcessRoutes({
      origin,
      destination,
      alternatives: options.alternatives || true,
      trafficModel: options.trafficModel || 'best_guess',
      avoid: options.avoid || []
    });
    
    // Calculate fuel estimates for each route
    const routesWithFuel = await calculateFuelEstimates(routes, motorData);
    
    // Analyze traffic conditions
    const trafficAnalysis = await analyzeTrafficConditions(routes);
    
    res.json({
      routes: routesWithFuel,
      trafficAnalysis,
      recommendations: await generateRouteRecommendations(routesWithFuel),
      performance: {
        routesProcessed: routes.length,
        processingTime: Date.now() - startTime,
        apiCalls: 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const getTrafficRateFromLeg = (leg) => {
  if (!leg || !leg.duration || !leg.duration_in_traffic) return 1;
  const dur = leg.duration.value;
  const durTraffic = leg.duration_in_traffic.value;
  if (!dur || dur <= 0) return 1;
  const ratio = durTraffic / dur;
  if (ratio <= 1.2) return 1;
  else if (ratio <= 1.5) return 2;
  else if (ratio <= 2.0) return 3;
  else if (ratio <= 2.5) return 4;
  else return 5;
};

const generateTrafficRecommendations = (routes) => {
  const recommendations = [];
  
  const bestRoute = routes.reduce((best, route) => 
    route.duration.value < best.duration.value ? route : best, routes[0]);
  
  if (bestRoute) {
    recommendations.push(`Best route: ${bestRoute.summary} (${bestRoute.duration.text})`);
  }
  
  const fuelEfficientRoute = routes.reduce((best, route) => 
    route.fuelConsumed < best.fuelConsumed ? route : best, routes[0]);
  
  if (fuelEfficientRoute && fuelEfficientRoute.fuelConsumed < 2) {
    recommendations.push(`Most fuel-efficient route: ${fuelEfficientRoute.summary}`);
  }
  
  return recommendations;
};

const calculateSafetyScore = (route) => {
  // Simplified safety score calculation
  let score = 100;
  
  if (route.trafficRate > 3) score -= 20;
  if (route.distance.value > 50000) score -= 10; // Long distance
  if (route.duration.value > 3600) score -= 15; // Long duration
  
  return Math.max(0, score);
};

const identifyRiskFactors = (route) => {
  const factors = [];
  
  if (route.trafficRate > 3) factors.push('Heavy traffic');
  if (route.distance.value > 50000) factors.push('Long distance');
  if (route.duration.value > 3600) factors.push('Long duration');
  
  return factors;
};

// Simulated functions (in real implementation, these would call external APIs)
const fetchAndProcessRoutes = async (params) => {
  // Simulate API call
  return [
    {
      id: 'route_1',
      summary: 'Fastest route',
      distance: { value: 15000, text: '15.0 km' },
      duration: { value: 1200, text: '20 mins' }
    }
  ];
};

const calculateFuelEstimates = async (routes, motorData) => {
  return routes.map(route => ({
    ...route,
    fuelConsumed: motorData ? route.distance.value / 1000 / motorData.fuelEfficiency : 0
  }));
};

const analyzeTrafficConditions = async (routes) => {
  return {
    currentConditions: 'moderate',
    delays: routes.map(route => ({
      routeId: route.id,
      delay: 300 // 5 minutes
    }))
  };
};

const generateRouteRecommendations = async (routes) => {
  return [
    'Consider leaving 10 minutes earlier to avoid traffic',
    'Route 1 is the most fuel-efficient option'
  ];
};

module.exports = {
  processDirections,
  processTrafficAnalysis,
  processRoutes
};
