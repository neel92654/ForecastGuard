/**
 * Demonstration Regional Boundaries & Centroids for Indian Meteorological Divisions/States
 * Note: These are approximate demonstration regional boundaries for prototype visualization.
 * ForecastGuard - MoES / NCMRWF Prototype
 */

export const INDIA_REGIONS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Gujarat", region: "Gujarat", zone: "West", climate: "Semi-Arid/Coastal" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [68.1, 23.8], [70.5, 24.7], [72.9, 24.5], [74.5, 23.5], [74.3, 21.5],
          [72.8, 20.3], [72.6, 21.5], [70.2, 20.8], [69.0, 22.3], [68.1, 23.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Maharashtra", region: "Maharashtra", zone: "West-Central", climate: "Ghats/Plateau" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.6, 20.0], [74.5, 21.5], [78.5, 21.7], [80.5, 21.4], [80.9, 18.7],
          [77.5, 17.5], [74.0, 15.8], [73.2, 17.5], [72.6, 20.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rajasthan", region: "Rajasthan", zone: "Northwest", climate: "Arid" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.5, 28.0], [71.5, 30.1], [74.0, 30.2], [77.5, 27.8], [78.0, 26.8],
          [76.8, 24.0], [74.5, 23.5], [71.0, 24.5], [69.5, 28.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kerala", region: "Kerala", zone: "South", climate: "Tropical Wet" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.8, 12.8], [76.0, 12.0], [77.2, 10.2], [77.5, 8.3], [76.8, 8.3],
          [76.0, 9.8], [75.0, 11.8], [74.8, 12.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Odisha", region: "Odisha", zone: "East", climate: "Coastal/Depression Track" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [81.4, 18.2], [83.0, 20.0], [84.5, 22.5], [87.5, 22.0], [87.0, 21.4],
          [85.5, 19.5], [84.8, 19.0], [81.4, 18.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Assam", region: "Assam", zone: "Northeast", climate: "Subtropical Humid" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [89.8, 26.2], [90.5, 27.0], [93.5, 27.5], [96.0, 27.8], [95.5, 26.8],
          [93.0, 25.5], [92.0, 24.5], [89.8, 26.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Punjab", region: "Punjab", zone: "North", climate: "Subtropical" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [73.8, 30.0], [74.5, 32.2], [75.8, 32.5], [76.8, 31.0], [75.8, 29.8],
          [73.8, 30.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Tamil Nadu", region: "Tamil Nadu", zone: "South", climate: "Rain-Shadow / NEM" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [76.2, 11.5], [78.0, 13.5], [80.3, 13.4], [79.8, 10.3], [77.5, 8.1],
          [77.2, 10.2], [76.2, 11.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Andhra Pradesh", region: "Andhra Pradesh", zone: "South-East", climate: "Coastal Wet-Dry" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [76.8, 14.0], [78.5, 16.0], [80.5, 18.7], [84.0, 19.0], [82.5, 16.5],
          [80.2, 13.5], [78.5, 13.0], [76.8, 14.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "West Bengal", region: "West Bengal", zone: "East", climate: "Gangetic Delta" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [86.0, 22.0], [87.5, 24.5], [88.2, 27.2], [89.8, 26.5], [88.8, 24.0],
          [88.8, 21.6], [87.5, 21.5], [86.0, 22.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Madhya Pradesh", region: "Madhya Pradesh", zone: "Central", climate: "Monsoon Trough" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.0, 22.0], [75.0, 25.5], [78.0, 26.8], [82.5, 24.5], [82.0, 21.8],
          [78.5, 21.7], [74.5, 21.5], [74.0, 22.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Uttar Pradesh", region: "Uttar Pradesh", zone: "North", climate: "Gangetic Plain" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.2, 28.5], [77.5, 30.5], [81.0, 28.5], [84.5, 27.5], [83.5, 24.0],
          [78.5, 24.5], [77.5, 27.5], [77.2, 28.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Karnataka", region: "Karnataka", zone: "South", climate: "Plateau / Coastal" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.0, 15.0], [75.5, 17.5], [77.5, 18.0], [78.2, 14.0], [77.0, 11.6],
          [75.0, 12.0], [74.3, 14.5], [74.0, 15.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Himachal Pradesh", region: "Himachal Pradesh", zone: "North-Himalayan", climate: "Montane" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [75.6, 32.2], [76.8, 33.2], [79.0, 32.0], [78.5, 31.0], [76.5, 31.0],
          [75.6, 32.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Bihar", region: "Bihar", zone: "East", climate: "Gangetic Plain" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [83.3, 25.0], [84.0, 27.5], [88.0, 26.5], [87.5, 24.5], [84.5, 24.5],
          [83.3, 25.0]
        ]]
      }
    }
  ]
};
