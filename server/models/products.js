
const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },              
    price: { type: Number, required: true, set: v => Number(v) },
    brand: { type: String },                             
    images: [{ type: String }],                          
    category: { type: String, required: true },          
    subCategory: { type: String },                      
    displayName: { type: String },                      

    description: { type: String, required: true },
    stock: { type: Number, required: true, set: v => Number(v) },
    rating: { type: Number, default: 0, set: v => Number(v) },

    specifications: { type: mongoose.Schema.Types.Mixed }, 
    tags: [{ type: String }],                            

    isFeatured: { type: Boolean, default: false },        
    offerPrice: { type: Number },                         
    views: { type: Number },                         

    reviews: {
      type: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        review: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      }],
      default: []
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    salesCount: {type: Number, default: 0, required: false},
    lastSoldAt: {type: Date, default: null, required: false},
  },
  { timestamps: true }
);

productSchema.index({ category: 1, subCategory: 1 }); // combo index for filters
productSchema.index({ subCategory: 1, rating: -1 });  // keep this, useful for top-rated sort
productSchema.index({ salesCount: -1 });
productSchema.index({ lastSoldAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ offerPrice: -1 });
productSchema.index({ brand: 1 }); // 🔥 Add this if you plan to filter by brand



const product = mongoose.model("products", productSchema);


module.exports = product;


