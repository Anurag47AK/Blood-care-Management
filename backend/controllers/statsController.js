const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const DonationRecord = require('../models/DonationRecord');

// @desc    Get public high-level statistics for homepage
// @route   GET /api/stats/public
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const totalDonors = await DonorProfile.countDocuments();
    const activeDonors = await DonorProfile.countDocuments({ isAvailable: true });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });
    const approvedDonations = await DonationRecord.countDocuments({ status: 'Approved' });

    // Inventory aggregate
    const inventory = await BloodInventory.find();
    const totalUnitsInStock = inventory.reduce((acc, curr) => acc + (curr.unitsAvailable || 0), 0);

    const pendingRequests = await BloodRequest.countDocuments({
      status: { $in: ['Pending', 'Approved'] }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalDonors,
        activeDonors,
        livesImpacted: fulfilledRequests + approvedDonations,
        totalUnitsInStock,
        activeRequests: pendingRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed statistics for Admin Dashboard
// @route   GET /api/stats/admin
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Donors counts
    const totalDonors = await DonorProfile.countDocuments();
    const activeDonors = await DonorProfile.countDocuments({ isAvailable: true });
    const totalUsers = await User.countDocuments();

    // 2. Request counts by status
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });
    const approvedRequests = await BloodRequest.countDocuments({ status: 'Approved' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });
    const rejectedRequests = await BloodRequest.countDocuments({ status: 'Rejected' });

    // 3. Donation counts
    const totalDonations = await DonationRecord.countDocuments();
    const pendingDonations = await DonationRecord.countDocuments({ status: 'Pending' });
    const approvedDonations = await DonationRecord.countDocuments({ status: 'Approved' });

    // 4. Inventory data
    const inventory = await BloodInventory.find().sort({ bloodGroup: 1 });
    const totalUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

    const stockChartData = inventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      units: item.unitsAvailable,
      status:
        item.unitsAvailable <= item.criticalThreshold
          ? 'Critical'
          : item.unitsAvailable <= item.lowStockThreshold
            ? 'Low'
            : 'Good'
    }));

    // 5. Low stock alerts
    const lowStockAlerts = inventory.filter(
      (item) => item.unitsAvailable <= item.lowStockThreshold
    );

    // 6. Recent blood requests
    const recentRequests = await BloodRequest.find()
      .populate('requester', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Recent donations
    const recentDonations = await DonationRecord.find()
      .populate('donor', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        totalDonors,
        activeDonors,
        totalUsers,
        totalRequests,
        pendingRequests,
        approvedRequests,
        fulfilledRequests,
        rejectedRequests,
        totalDonations,
        pendingDonations,
        approvedDonations,
        totalUnits
      },
      stockChartData,
      lowStockAlerts,
      recentRequests,
      recentDonations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
  getAdminStats
};
