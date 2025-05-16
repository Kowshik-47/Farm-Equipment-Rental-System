const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  equipment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Equipment', 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'In Progress', 'active'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  paymentId: { 
    type: String 
  },
  proofImage: { 
    type: String 
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

// Virtual for rental duration in days
bookingSchema.virtual('durationDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate total amount if not provided
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.totalAmount) {
    try {
      const Equipment = mongoose.model('Equipment');
      const equipment = await Equipment.findById(this.equipment);
      
      if (!equipment) {
        return next(new Error('Equipment not found'));
      }
      
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      this.totalAmount = diffDays * equipment.dailyRate;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compound index for efficient date range queries
bookingSchema.index({ equipment: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ farmer: 1, status: 1 });
bookingSchema.index({ status: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;