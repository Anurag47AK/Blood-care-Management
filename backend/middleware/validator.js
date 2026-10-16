/**
 * Input Validation & Sanitization Middleware
 */

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_URGENCIES = ['Normal', 'Urgent', 'Critical'];
const VALID_ROLES = ['donor', 'requester'];

// Sanitize string (trim and strip basic dangerous characters/tags)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

const validateRegistration = (req, res, next) => {
  const { name, email, password, phone, city, role = 'donor', bloodGroup, age, gender, weight } = req.body;

  const errors = [];

  // Name
  const cleanName = sanitizeString(name);
  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    errors.push('Full name is required and must be between 2 and 100 characters.');
  }
  req.body.name = cleanName;

  // Email
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  } else {
    req.body.email = email.toLowerCase().trim();
  }

  // Password
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long.');
  }

  // Phone
  const cleanPhone = sanitizeString(phone);
  if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 20) {
    errors.push('A valid contact phone number is required (8-20 characters).');
  }
  req.body.phone = cleanPhone;

  // City
  const cleanCity = sanitizeString(city);
  if (!cleanCity || cleanCity.length < 2) {
    errors.push('City is required.');
  }
  req.body.city = cleanCity;

  // Role
  if (role && !['donor', 'requester'].includes(role)) {
    errors.push("Role must be either 'donor' or 'requester'.");
  }

  // Donor-specific validations
  if (role === 'donor') {
    if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
      errors.push(`Blood group is required and must be one of: ${VALID_BLOOD_GROUPS.join(', ')}.`);
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
      errors.push('Donor age must be an integer between 18 and 65 years.');
    }
    req.body.age = parsedAge;

    const normalizedGender = typeof gender === 'string'
      ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
      : '';
    if (!normalizedGender || !['Male', 'Female', 'Other'].includes(normalizedGender)) {
      errors.push("Gender is required ('Male', 'Female', or 'Other').");
    } else {
      req.body.gender = normalizedGender;
    }

    const parsedWeight = Number(weight);
    if (isNaN(parsedWeight) || parsedWeight < 45 || parsedWeight > 250) {
      errors.push('Donor weight must be at least 45 kg.');
    }
    req.body.weight = parsedWeight;
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

const validateBloodRequest = (req, res, next) => {
  const {
    patientName,
    bloodGroup,
    unitsRequired,
    hospitalName,
    hospitalAddress,
    city,
    urgency = 'Normal',
    requiredDate,
    contactName,
    contactPhone,
    reason
  } = req.body;

  const errors = [];

  const cleanPatient = sanitizeString(patientName);
  if (!cleanPatient || cleanPatient.length < 2) {
    errors.push('Patient name is required (min 2 characters).');
  }
  req.body.patientName = cleanPatient;

  if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push(`Invalid blood group. Must be one of: ${VALID_BLOOD_GROUPS.join(', ')}.`);
  }

  const parsedUnits = parseInt(unitsRequired, 10);
  if (isNaN(parsedUnits) || parsedUnits < 1 || parsedUnits > 10) {
    errors.push('Units required must be an integer between 1 and 10.');
  }
  req.body.unitsRequired = parsedUnits;

  const cleanHospital = sanitizeString(hospitalName);
  if (!cleanHospital) {
    errors.push('Hospital or medical center name is required.');
  }
  req.body.hospitalName = cleanHospital;

  const cleanAddress = sanitizeString(hospitalAddress);
  if (!cleanAddress) {
    errors.push('Hospital ward / address is required.');
  }
  req.body.hospitalAddress = cleanAddress;

  const cleanCity = sanitizeString(city);
  if (!cleanCity) {
    errors.push('City is required.');
  }
  req.body.city = cleanCity;

  if (urgency && !VALID_URGENCIES.includes(urgency)) {
    errors.push(`Urgency level must be one of: ${VALID_URGENCIES.join(', ')}.`);
  }

  if (!requiredDate) {
    errors.push('Date needed is required.');
  } else {
    const parsedDate = new Date(requiredDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Please provide a valid required date.');
    }
  }

  const cleanContactName = sanitizeString(contactName);
  if (!cleanContactName) {
    errors.push('Contact person name is required.');
  }
  req.body.contactName = cleanContactName;

  const cleanContactPhone = sanitizeString(contactPhone);
  if (!cleanContactPhone || cleanContactPhone.length < 8) {
    errors.push('Contact phone number is required (at least 8 characters).');
  }
  req.body.contactPhone = cleanContactPhone;

  const cleanReason = sanitizeString(reason);
  if (!cleanReason) {
    errors.push('Medical reason / procedure description is required.');
  }
  req.body.reason = cleanReason;

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  next();
};

const validateInventoryOperation = (req, res, next) => {
  const { bloodGroup, units, newUnits, reason } = req.body;
  const errors = [];

  if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push(`Valid blood group is required (${VALID_BLOOD_GROUPS.join(', ')}).`);
  }

  if (units !== undefined) {
    const parsedUnits = parseInt(units, 10);
    if (isNaN(parsedUnits) || parsedUnits <= 0) {
      errors.push('Units must be a positive integer greater than 0.');
    }
    req.body.units = parsedUnits;
  }

  if (newUnits !== undefined) {
    const parsedNewUnits = parseInt(newUnits, 10);
    if (isNaN(parsedNewUnits) || parsedNewUnits < 0) {
      errors.push('Target inventory units cannot be negative.');
    }
    req.body.newUnits = parsedNewUnits;
  }

  const cleanReason = sanitizeString(reason);
  if (!cleanReason) {
    errors.push('A valid audit reason is required for inventory movements.');
  }
  req.body.reason = cleanReason;

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  next();
};

const validateRejection = (req, res, next) => {
  const reason = sanitizeString(req.body.rejectionReason);
  if (!reason || reason.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'A mandatory rejection reason of at least 3 characters is required.'
    });
  }
  req.body.rejectionReason = reason;
  next();
};

module.exports = {
  VALID_BLOOD_GROUPS,
  VALID_URGENCIES,
  validateRegistration,
  validateLogin,
  validateBloodRequest,
  validateInventoryOperation,
  validateRejection
};
