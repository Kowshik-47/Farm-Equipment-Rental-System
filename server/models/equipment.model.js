const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  dailyRate: { 
    type: Number, 
    required: true,
    min: 0
  },
  images: [{ 
    type: String 
  }],
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  isInMaintenance: { 
    type: Boolean, 
    default: false 
  },
  features: [{ 
    type: String 
  }],
  specifications: { 
    type: Map, 
    of: String 
  }
}, { timestamps: true });

// Virtual for checking if equipment can be booked
equipmentSchema.virtual('canBeBooked').get(function() {
  return this.isAvailable && !this.isInMaintenance;
});

// Method to get equipment by category
equipmentSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

// Index for faster searches
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ isAvailable: 1, isInMaintenance: 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;