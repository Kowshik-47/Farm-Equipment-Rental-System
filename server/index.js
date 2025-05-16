require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51J2aBcD3f9kLmNpX8zQwRtYpZsXr7HvJmPqKxN4bLcT2mF9vA3dG8hB5nQwRtYpZsXr7HvJmPqKxN4');
const nodemailer = require('nodemailer');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const passCodes = {};
const resetPasscodeExpiry = {};

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-equipment-rental')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Schema Definitions
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  profileImage: String,
}, { timestamps: true });

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dailyRate: { type: Number, required: true },
  images: [String],
  isAvailable: { type: Boolean, default: true },
  isInMaintenance: { type: Boolean, default: false },
  features: [String],
  specifications: { type: Map, of: String }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'In Progress', 'active'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentId: String,
  proofImage: String,
  notes: String
}, { timestamps: true });

// Models

const User = mongoose.model('User', userSchema);
const Equipment = mongoose.model('Equipment', equipmentSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role || 'farmer'  // Default to farmer if role not specified
    });
    
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create and sign JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    // Don't send password in response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('email', email)
  // Input validation
  if (!email) {
    return res.status(400).json({ message: 'Missing required field: email' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid user' });
    }

    // Generate 6-digit passcode
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    passCodes[email] = passcode;
    resetPasscodeExpiry[email] = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com', // Use environment variable
        pass: 'Your App Password' // Use environment variable
      }
    });

    // Email options
    const mailOptions = {
      from: 'agroequip@gmail.com',
      to: email,
      subject: 'AgroEquip Password Reset Passcode',
      text: `Your passcode for password reset is: ${passcode}. It is valid for 15 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Passcode sent to email' });
  } catch (error) {
    console.error('Error sending passcode:', error);
    res.status(500).json({ message: 'Failed to send passcode', error: error.message });
  }
});

// Verify passcode
app.post('/api/auth/verify-passcode', async (req, res) => {
  const { email, passcode } = req.body;

  // Input validation
  if (!email || !passcode) {
    return res.status(400).json({ message: 'Missing required fields: email and passcode' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid user' });
    }

    if (
      passCodes[email] !== passcode ||
      !resetPasscodeExpiry[email] ||
      resetPasscodeExpiry[email] < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired passcode' });
    }

    res.status(200).json({ message: 'Passcode verified' });
  } catch (error) {
    console.error('Error verifying passcode:', error);
    res.status(500).json({ message: 'Failed to verify passcode', error: error.message });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  // Input validation
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields: email and newPassword' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid user' });
    }

    if (!passCodes[email] || !resetPasscodeExpiry[email] || resetPasscodeExpiry[email] < new Date()) {
      return res.status(400).json({ message: 'Passcode verification required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword; 
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// User Routes
app.get('/api/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/users/:id', authenticate, async (req, res) => {
  try {
    // Admin can view any user, farmer can only view their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, address, role } = req.body;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, role },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/users/:id/promote', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/users/:id/demote', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'farmer' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Equipment Routes
app.get('/api/equipment', async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/equipment/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/equipment', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, dailyRate, features } = req.body;
    const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : {};
    // Process uploaded images
    const images = req.files.map(file => `/uploads/${file.filename}`);

    const newEquipment = new Equipment({
      name,
      description,
      category,
      dailyRate: parseFloat(dailyRate),
      images,
      features: features ? features.split(',') : [],
      specifications
    });
    
    await newEquipment.save();
    
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/equipment/:id', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, dailyRate, features } = req.body;
    const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : {};
    
    // Get existing equipment to check for images
    const existingEquipment = await Equipment.findById(req.params.id);
    
    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Process new images if any
    let images = existingEquipment.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...existingEquipment.images, ...newImages];
    }
    
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        dailyRate: parseFloat(dailyRate),
        images,
        features: features ? features.split(',') : existingEquipment.features,
        specifications
      },
      { new: true }
    );
    
    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/equipment/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/equipment/:id/maintenance', authenticate, isAdmin, async (req, res) => {
  try {
    const { isInMaintenance } = req.body;
    
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isInMaintenance },
      { new: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/equipment/available', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Find equipment that is not in maintenance
    const availableEquipment = await Equipment.find({ isInMaintenance: false });
    
    // Find bookings that overlap with the requested date range
    const overlappingBookings = await Booking.find({
      status: { $nin: ['cancelled'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });
    
    // Extract equipment IDs that are already booked
    const bookedEquipmentIds = overlappingBookings.map(booking => booking.equipment.toString());
    
    // Filter out booked equipment
    const availableEquipmentFiltered = availableEquipment.filter(
      equipment => !bookedEquipmentIds.includes(equipment._id.toString())
    );
    
    res.json(availableEquipmentFiltered);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Booking Routes
app.post('/api/bookings/send-email', async (req, res) => {
  const { email, pdfData } = req.body;
  console.log('email', email) 
  // Input validation
  if (!email || !pdfData) {
    return res.status(400).json({ message: 'Missing required fields: email and pdfData' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'agroequip@gmail.com', // Use environment variable
      pass: 'App Passcode'  // Use environment variable
    }
  });

  // Email options
  const mailOptions = {
    from: 'agroequip@gmail.com',
    to: email,
    subject: 'Booking Confirmation',
    text: 'Please find your booking confirmation attached.',
    attachments: [
      {
        filename: 'booking_confirmation.pdf', // Static filename since bookingId is not provided
        content: pdfData.split(',')[1], // Extract base64 data
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    // Admins can see all bookings, farmers only see their own
    const query = req.user.role === 'admin' ? {} : { farmer: req.user._id };
    
    const today = new Date()

    await Booking.updateMany(
      {
        startDate: { $lte: today },
        endDate: { $gte: today },
        status: { $in: ['confirmed'] } // Optional: avoid updating already active bookings
      },
      {
        $set: { status: 'active' }
      }
    );

    await Booking.updateMany(
      {
        endDate: { $lt: today },
        status: { $ne: 'completed' } // Optional: avoid updating already completed bookings
      },
      {
        $set: { status: 'completed' }
      }
    );

    const bookings = await Booking.find(query)
      .populate('equipment')
      .populate('farmer', '-password')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/bookings/payments/process', async (req, res) => {
  try {
    const { bookingId } = req.body;
    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update in database
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: `sim_pay_${Date.now()}`,
        paymentDate: new Date()
      },
      { new: true }
    ).populate('equipment').populate('farmer', '-password');

    res.json({
      success: true,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      message: 'Payment processing failed', 
      error: error.message 
    });
  }
});

app.get('/api/bookings/active', authenticate, isAdmin, async (req, res) => {
  try {
    const currentDate = new Date();

    const activeBookings = await Booking.find({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      equipment : { $ne : null }
    },
  ).populate('farmer', '-password')
    .populate('equipment')
    

    res.status(200).json(activeBookings);
  } catch (error) {
    console.error('Error fetching active bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/bookings/statistics', authenticate, isAdmin, async (req, res) => {
  try {
    // Total number of bookings
    
    const totalBookings = await Booking.countDocuments();
    
    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $match: {
          equipment : { $ne : null }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Total revenue
    const revenue = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['active', 'completed', 'confirmed'] },
          equipment : { $ne : null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ])
    
    // Bookings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          equipment : { $ne : null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
    
    // Most popular equipment
    const popularEquipment = await Booking.aggregate([
      {
        $group: {
          _id: '$equipment',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          equipment: {
            $cond: {
              if: { $gt: [{ $size: '$equipmentDetails' }, 0] },
              then: { $arrayElemAt: ['$equipmentDetails', 0] },
              else: null
            }
          }
        }
      },
      {
        $match: {
          equipment: { $ne: null }
        }
      }
    ])
    
    res.json({
      totalBookings,
      bookingsByStatus,
      revenue: revenue.length > 0 ? revenue[0].total : 0,
      bookingsByMonth,
      popularEquipment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/bookings/user', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user._id,equipment : { $ne : null } })
      .populate('equipment')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/bookings/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('farmer', '-password')
      .populate('equipment');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to this booking
    if (req.user.role !== 'admin' && booking.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/bookings', authenticate, upload.single('proofImage'), async (req, res) => {
  try {
    const { equipment, startDate, endDate, totalAmount, notes } = req.body;
    
    // Check if equipment exists and is not in maintenance
    const equipmentItem = await Equipment.findById(equipment);
    if (!equipmentItem) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    if (equipmentItem.isInMaintenance) {
      return res.status(400).json({ message: 'Equipment is currently under maintenance' });
    }
    
    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      equipment,
      status: { $nin: ['cancelled'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });
    
    if (overlappingBookings.length > 0) {
      return res.status(400).json({ message: 'Equipment is already booked for these dates' });
    }
    
    // Process uploaded image if any
    const proofImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    const newBooking = new Booking({
      farmer: req.user._id,
      equipment,
      startDate,
      endDate,
      totalAmount: parseFloat(totalAmount),
      notes,
      proofImage
    });
    
    await newBooking.save();
    
    // Populate the booking with equipment and farmer details for response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('equipment')
      .populate('farmer', '-password');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


app.put('/api/bookings/:id', authenticate, upload.single('proofImage'), async (req, res) => {
  try {
    const { startDate, endDate, totalAmount, notes, status } = req.body;
    
    // Check if booking exists
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to update this booking
    if (req.user.role !== 'admin' && booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Prevent updating if booking is already confirmed or completed
    if (['confirmed', 'completed'].includes(booking.status) && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot update confirmed or completed bookings' });
    }
    
    // Process uploaded image if any
    let proofImage = booking.proofImage;
    if (req.file) {
      proofImage = `/uploads/${req.file.filename}`;
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        startDate,
        endDate,
        totalAmount: parseFloat(totalAmount),
        notes,
        proofImage
      },
      { new: true }
    ).populate('equipment').populate('farmer', '-password');
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    // Check if booking exists
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to cancel this booking
    if (req.user.role !== 'admin' && booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Prevent cancelling if booking is already completed
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed bookings' });
    }
    
    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('equipment').populate('farmer', '-password');
    
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Payment Routes
app.post('/api/payments/process', authenticate, async (req, res) => {
  console.log('payment', req.body)
  try {
    const { bookingId, paymentMethodId } = req.body;
    
    // Get booking details
    const booking = await Booking.findById(bookingId).populate('equipment');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to this booking
    if (booking.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to process payment for this booking' });
    }
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Rental payment for ${booking.equipment.name}`
    });
    
    // Update booking with payment info
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        paymentId: paymentIntent.id,
        status: 'confirmed'
      },
      { new: true }
    ).populate('equipment').populate('farmer', '-password');
    
    res.json({
      success: true,
      paymentIntent,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});