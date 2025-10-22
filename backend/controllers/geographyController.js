const Report = require('../models/Report');
const GasStation = require('../models/GasStation');

class GeographyController {
  // Get geographic data for dashboard
  async getGeographyData(req, res) {
    try {
      const { type = 'all' } = req.query;
      
      let data = {};
      
      if (type === 'all' || type === 'reports') {
        // Get reports by barangay
        const reportsByBarangay = await Report.aggregate([
          {
            $group: {
              _id: "$location.barangay",
              count: { $sum: 1 },
              types: { $addToSet: "$type" }
            }
          },
          { $sort: { count: -1 } }
        ]);
        
        data.reports = reportsByBarangay;
      }
      
      if (type === 'all' || type === 'gas-stations') {
        // Get gas stations by location
        const gasStationsByLocation = await GasStation.aggregate([
          {
            $group: {
              _id: "$location.barangay",
              count: { $sum: 1 },
              brands: { $addToSet: "$brand" }
            }
          },
          { $sort: { count: -1 } }
        ]);
        
        data.gasStations = gasStationsByLocation;
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching geography data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch geography data',
        message: error.message 
      });
    }
  }

  // Get barangay data
  async getBarangayData(req, res) {
    try {
      const { barangay } = req.params;
      
      const [reports, gasStations] = await Promise.all([
        Report.find({ 'location.barangay': barangay }),
        GasStation.find({ 'location.barangay': barangay })
      ]);

      const reportStats = await Report.aggregate([
        { $match: { 'location.barangay': barangay } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        barangay,
        reports: {
          total: reports.length,
          byType: reportStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        gasStations: {
          total: gasStations.length,
          byBrand: gasStations.reduce((acc, station) => {
            acc[station.brand] = (acc[station.brand] || 0) + 1;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      console.error('Error fetching barangay data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch barangay data',
        message: error.message 
      });
    }
  }

  // Get geographic statistics
  async getGeographyStatistics(req, res) {
    try {
      const [
        totalReports,
        totalGasStations,
        reportsByBarangay,
        gasStationsByBarangay,
        mostActiveBarangay
      ] = await Promise.all([
        Report.countDocuments(),
        GasStation.countDocuments(),
        Report.aggregate([
          {
            $group: {
              _id: "$location.barangay",
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        GasStation.aggregate([
          {
            $group: {
              _id: "$location.barangay",
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Report.aggregate([
          {
            $group: {
              _id: "$location.barangay",
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ])
      ]);

      res.json({
        totalReports,
        totalGasStations,
        reportsByBarangay,
        gasStationsByBarangay,
        mostActiveBarangay: mostActiveBarangay[0] || null
      });
    } catch (error) {
      console.error('Error fetching geography statistics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch geography statistics',
        message: error.message 
      });
    }
  }
}

module.exports = new GeographyController();
