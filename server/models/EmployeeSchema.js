const employeeSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    department: { type: String, required: true },
    salary: { type: Number, required: true },
    joiningDate: { type: Date, required: true },
    address: { type: String, required: true },
    emergencyContact: { type: String },
    status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
    documents: [{ 
      name: String, 
      url: String, 
      uploadDate: { type: Date, default: Date.now } 
    }],
    attendance: [{
      date: { type: Date },
      status: { type: String, enum: ['Present', 'Absent', 'Half Day', 'Leave'] },
      checkIn: { type: Date },
      checkOut: { type: Date }
    }],
    
  }, { timestamps: true });