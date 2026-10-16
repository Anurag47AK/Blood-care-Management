/**
 * Blood Care Management System - Smart Donor Matching Engine
 * ABO / Rh Red Blood Cell (RBC) Compatibility Matrix & Ranking Engine
 */

// Red Blood Cell (RBC) Recipient -> Compatible Donor blood groups
const RBC_COMPATIBILITY_RECIPIENT = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

// RBC Donor -> Compatible Recipient blood groups
const RBC_COMPATIBILITY_DONOR = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

/**
 * Get all blood groups that can donate Red Blood Cells to a given recipient blood group
 */
const getCompatibleDonorGroups = (recipientGroup) => {
  return RBC_COMPATIBILITY_RECIPIENT[recipientGroup] || [];
};

/**
 * Check if a donor's blood group is RBC compatible with a recipient's blood group
 */
const isRBCCompatible = (donorGroup, recipientGroup) => {
  const compatibleGroups = getCompatibleDonorGroups(recipientGroup);
  return compatibleGroups.includes(donorGroup);
};

/**
 * Calculate donor eligibility interval
 * Minimum 90 days (approx 3 months) between whole blood donations
 */
const checkDonationEligibility = (lastDonationDate) => {
  if (!lastDonationDate) {
    return {
      isEligible: true,
      daysSinceLastDonation: null,
      message: 'No previous donation recorded. Eligible for initial screening.'
    };
  }

  const lastDate = new Date(lastDonationDate);
  const now = new Date();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  const minRequiredDays = 90;

  if (diffDays >= minRequiredDays) {
    return {
      isEligible: true,
      daysSinceLastDonation: diffDays,
      message: `${diffDays} days since last donation. Meets the 90-day whole blood interval.`
    };
  } else {
    return {
      isEligible: false,
      daysSinceLastDonation: diffDays,
      daysRemaining: minRequiredDays - diffDays,
      message: `Only ${diffDays} days since last donation. Requires ${minRequiredDays - diffDays} more days before eligible.`
    };
  }
};

/**
 * Score and rank candidate donors for a specific blood request
 * @param {Object} request - BloodRequest object or search parameters
 * @param {Array} donors - List of donor profiles populated with user info
 * @returns {Array} - Ranked list of donors with match details and scores
 */
const scoreAndRankDonors = (request, donors) => {
  const recipientGroup = request.bloodGroup;
  const targetCity = (request.city || '').toLowerCase().trim();
  const isUrgent = request.urgency === 'Urgent' || request.urgency === 'Critical';

  const scoredDonors = donors.map((donorProfile) => {
    const donorGroup = donorProfile.bloodGroup;
    const donorCity = (donorProfile.city || donorProfile.user?.city || '').toLowerCase().trim();
    const isAvailable = Boolean(donorProfile.isAvailable);
    const eligibility = checkDonationEligibility(donorProfile.lastDonationDate);

    // Baseline compatibility check
    const compatible = isRBCCompatible(donorGroup, recipientGroup);
    const isExactMatch = donorGroup === recipientGroup;

    let score = 0;
    const matchReasons = [];

    // 1. Blood Compatibility Scoring (Max 40 points)
    if (isExactMatch) {
      score += 40;
      matchReasons.push(`Exact blood group match (${donorGroup})`);
    } else if (compatible) {
      score += 30;
      matchReasons.push(`Compatible universal/alternative RBC donor (${donorGroup} for ${recipientGroup})`);
    } else {
      score = 0; // Incompatible blood type cannot be matched
      return {
        donor: donorProfile,
        score: 0,
        compatible: false,
        isExactMatch: false,
        matchReasons: [`Incompatible blood group (${donorGroup} cannot be given to ${recipientGroup})`],
        eligibility,
        medicalDisclaimer: 'Donor is NOT RBC-compatible for this recipient.'
      };
    }

    // 2. Geographic Proximity Scoring (Max 30 points)
    if (targetCity && donorCity && targetCity === donorCity) {
      score += 30;
      matchReasons.push(`Located in same city (${donorProfile.city})`);
    } else {
      score += 10;
      matchReasons.push(`Located in regional area (${donorProfile.city || 'Nearby'})`);
    }

    // 3. Availability Status (Max 20 points)
    if (isAvailable) {
      score += 20;
      matchReasons.push('Marked as currently available to donate');
    } else {
      score -= 10;
      matchReasons.push('Currently marked unavailable by donor');
    }

    // 4. Time Interval Eligibility (Max 10 points)
    if (eligibility.isEligible) {
      score += 10;
      matchReasons.push(eligibility.message);
    } else {
      score -= 25;
      matchReasons.push(`Warning: ${eligibility.message}`);
    }

    // 5. Urgency weighting
    if (isUrgent && isAvailable && eligibility.isEligible) {
      score += 5;
      matchReasons.push('Fast-response priority for urgent medical request');
    }

    // Normalize score to 0 - 100
    const finalScore = Math.max(0, Math.min(100, score));

    return {
      donor: donorProfile,
      donorId: donorProfile._id,
      name: donorProfile.user?.name || 'Voluntary Donor',
      phone: donorProfile.user?.phone || '',
      city: donorProfile.city || donorProfile.user?.city || '',
      bloodGroup: donorProfile.bloodGroup,
      score: finalScore,
      compatible: true,
      isExactMatch,
      matchReasons,
      eligibility,
      medicalDisclaimer:
        'Smart match is advisory based on RBC compatibility and profile data. Physical screening, hemoglobin test, and laboratory cross-matching are mandatory prior to transfusion.'
    };
  });

  // Filter out completely incompatible donors and sort descending by score
  return scoredDonors
    .filter((item) => item.compatible)
    .sort((a, b) => b.score - a.score);
};

module.exports = {
  RBC_COMPATIBILITY_RECIPIENT,
  RBC_COMPATIBILITY_DONOR,
  getCompatibleDonorGroups,
  isRBCCompatible,
  checkDonationEligibility,
  scoreAndRankDonors
};
