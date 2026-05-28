const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const connectDB = require('../config/db');

// Realistic Hot Wheels details
const productTemplates = {
  'Mainline': [
    { name: "Custom '67 Pontiac Firebird", subCategory: "HW Speed Graphics", price: 299, originalPrice: 399 },
    { name: "'70 Dodge Charger R/T", subCategory: "HW Muscle Mania", price: 249, originalPrice: 299 },
    { name: "Porsche 911 GT3 RS", subCategory: "HW Exotics", price: 349, originalPrice: 449 },
    { name: "'68 El Camino", subCategory: "HW Hot Trucks", price: 249, originalPrice: 299 },
    { name: "Ford Mustang Mach 1", subCategory: "HW Muscle Mania", price: 299, originalPrice: 349 },
    { name: "'98 Subaru Impreza 22B STi", subCategory: "HW J-Imports", price: 349, originalPrice: 399 },
    { name: "Aston Martin Valhalla Concept", subCategory: "HW Exotics", price: 399, originalPrice: 499 },
    { name: "'89 Mazda Savannah RX-7 FC", subCategory: "HW J-Imports", price: 299, originalPrice: 399 },
    { name: "'16 Bugatti Chiron", subCategory: "HW Exotics", price: 449, originalPrice: 599 },
    { name: "Shelby Cobra 427 S/C", subCategory: "HW Roadsters", price: 349, originalPrice: 449 },
    { name: "Tesla Roadster", subCategory: "HW Green Speed", price: 299, originalPrice: 349 },
    { name: "'67 Chevy C10", subCategory: "HW Hot Trucks", price: 299, originalPrice: 399 },
    { name: "Lamborghini Sesto Elemento", subCategory: "HW Exotics", price: 349, originalPrice: 449 },
    { name: "'69 Dodge Charger Daytona", subCategory: "HW Muscle Mania", price: 299, originalPrice: 399 },
    { name: "McLaren P1", subCategory: "HW Exotics", price: 399, originalPrice: 499 },
    { name: "Nissan Skyline GT-R R34", subCategory: "HW J-Imports", price: 499, originalPrice: 599 }
  ],
  'Premium': [
    { name: "Toyota Supra (Fast & Furious)", subCategory: "Car Culture Premium", price: 1299, originalPrice: 1599 },
    { name: "Nissan Skyline GT-R R32 Advan", subCategory: "Advan Racing Premium", price: 1499, originalPrice: 1899 },
    { name: "Gulf Porsche 917 LH", subCategory: "Car Culture Premium", price: 1699, originalPrice: 1999 },
    { name: "Ford GT LM (Premium)", subCategory: "Speed Machines Premium", price: 1399, originalPrice: 1699 },
    { name: "Mercedes-Benz 190E Evolution II", subCategory: "Car Culture Premium", price: 1599, originalPrice: 1999 },
    { name: "Audi Sport Quattro S1", subCategory: "Thrilling Thirty Premium", price: 1299, originalPrice: 1599 },
    { name: "Lancia Delta Integrale", subCategory: "Car Culture Premium", price: 1199, originalPrice: 1499 },
    { name: "Porsche 959 Dakar", subCategory: "Wild Terrain Premium", price: 1499, originalPrice: 1799 },
    { name: "Jaguar Lightweight E-Type", subCategory: "British Legends Premium", price: 1399, originalPrice: 1699 },
    { name: "BMW M3 E46 GTR", subCategory: "Speed Machines Premium", price: 1699, originalPrice: 2099 },
    { name: "Mazda RX-7 FD Spirit R", subCategory: "Car Culture Premium", price: 1499, originalPrice: 1899 },
    { name: "Chevrolet Corvette C8.R", subCategory: "Speed Machines Premium", price: 1299, originalPrice: 1599 },
    { name: "Aston Martin DB5 (007)", subCategory: "Entertainment Premium", price: 1599, originalPrice: 1999 },
    { name: "Subaru WRX STI NBR Challenge", subCategory: "Car Culture Premium", price: 1399, originalPrice: 1699 },
    { name: "Ferrari F40 Competizione", subCategory: "Retro Vintage Premium", price: 2499, originalPrice: 2999 },
    { name: "Dodge Viper GTS-R Racing", subCategory: "Car Culture Premium", price: 1299, originalPrice: 1599 }
  ],
  'Treasure Hunts': [
    { name: "'65 Mustang Fastback (Super TH)", subCategory: "Super Treasure Hunt", price: 3499, originalPrice: 3999 },
    { name: "'71 Datsun 510 Wagon (Super TH)", subCategory: "Super Treasure Hunt", price: 4999, originalPrice: 5999 },
    { name: "Custom '18 Ford Mustang GT (TH)", subCategory: "Treasure Hunt", price: 899, originalPrice: 1099 },
    { name: "Gotta Go Toilet Car (TH)", subCategory: "Treasure Hunt", price: 499, originalPrice: 699 },
    { name: "Circle Tracker (TH)", subCategory: "Treasure Hunt", price: 599, originalPrice: 799 },
    { name: "'17 Jeep Wrangler Unlimited (TH)", subCategory: "Treasure Hunt", price: 799, originalPrice: 999 },
    { name: "Cuz Up Truck (TH)", subCategory: "Treasure Hunt", price: 499, originalPrice: 699 },
    { name: "Dune Daddy Offroad (TH)", subCategory: "Treasure Hunt", price: 599, originalPrice: 799 },
    { name: "Baja Bone Shaker (TH)", subCategory: "Treasure Hunt", price: 799, originalPrice: 999 },
    { name: "'67 Commando Military Jeep (TH)", subCategory: "Treasure Hunt", price: 699, originalPrice: 899 },
    { name: "'91 GMC Syclone Truck (Super TH)", subCategory: "Super Treasure Hunt", price: 3999, originalPrice: 4599 },
    { name: "'20 Corvette C8 Stingray (Super TH)", subCategory: "Super Treasure Hunt", price: 4299, originalPrice: 4999 },
    { name: "Rodger Dodger Chrome (Super TH)", subCategory: "Super Treasure Hunt", price: 3799, originalPrice: 4499 },
    { name: "'68 Mercury Cougar Custom (Super TH)", subCategory: "Super Treasure Hunt", price: 3599, originalPrice: 4199 },
    { name: "'83 Chevy Silverado (Super TH)", subCategory: "Super Treasure Hunt", price: 4899, originalPrice: 5499 },
    { name: "'64 Chevy Chevelle SS (Super TH)", subCategory: "Super Treasure Hunt", price: 3199, originalPrice: 3799 }
  ],
  'Redline Club': [
    { name: "'72 Skyline H/T 2000GT-R RLC", subCategory: "RLC Exclusive", price: 6999, originalPrice: 7999 },
    { name: "'41 Willys Gasser Chrome RLC", subCategory: "RLC Exclusive", price: 5999, originalPrice: 6999 },
    { name: "Custom '70 Chevy Nova RLC", subCategory: "RLC Exclusive", price: 5499, originalPrice: 6499 },
    { name: "'69 Dodge Charger R/T Black RLC", subCategory: "RLC Exclusive", price: 6499, originalPrice: 7499 },
    { name: "Volkswagen T1 Rockster Offroad RLC", subCategory: "RLC Exclusive", price: 7999, originalPrice: 8999 },
    { name: "1972 De Tomaso Mangusta Orange RLC", subCategory: "RLC Exclusive", price: 5999, originalPrice: 6999 },
    { name: "'93 Mustang Cobra R Teal RLC", subCategory: "RLC Exclusive", price: 6299, originalPrice: 7299 },
    { name: "'21 Pagani Huayra Roadster BC RLC", subCategory: "RLC Exclusive", price: 8999, originalPrice: 9999 },
    { name: "Lamborghini Countach LP500S RLC", subCategory: "RLC Exclusive", price: 7499, originalPrice: 8499 },
    { name: "'66 Super Nova Drag Racer RLC", subCategory: "RLC Exclusive", price: 6999, originalPrice: 7999 },
    { name: "'55 Chevy Bel Air Gasser RLC", subCategory: "RLC Exclusive", price: 8499, originalPrice: 9999 },
    { name: "'70 Mustang Boss 302 Yellow RLC", subCategory: "RLC Exclusive", price: 6199, originalPrice: 7199 },
    { name: "'90 Shadow Jet Spectraflame RLC", subCategory: "RLC Exclusive", price: 5299, originalPrice: 6299 },
    { name: "Custom '72 Datsun 240Z Chrome RLC", subCategory: "RLC Exclusive", price: 7799, originalPrice: 8799 },
    { name: "'82 Lamborghini Countach LP500 S RLC", subCategory: "RLC Exclusive", price: 8299, originalPrice: 9299 },
    { name: "'71 Datsun Bluebird 510 RLC", subCategory: "RLC Exclusive", price: 9499, originalPrice: 10999 }
  ],
  'Pop Culture': [
    { name: "Back to the Future DeLorean", subCategory: "Retro Entertainment Pop Culture", price: 999, originalPrice: 1299 },
    { name: "The Dark Knight Tumbler Batmobile", subCategory: "DC Comics Pop Culture", price: 899, originalPrice: 1099 },
    { name: "Scooby-Doo The Mystery Machine", subCategory: "Hanna-Barbera Pop Culture", price: 1199, originalPrice: 1499 },
    { name: "Ghostbusters Ecto-1 Cadillac", subCategory: "Retro Entertainment Pop Culture", price: 1099, originalPrice: 1399 },
    { name: "Star Wars X-Wing Fighter Carships", subCategory: "Star Wars Pop Culture", price: 799, originalPrice: 999 },
    { name: "Marvel Spider-Man Web Slinger Roadster", subCategory: "Marvel Pop Culture", price: 799, originalPrice: 999 },
    { name: "Jurassic Park Ford Explorer Tour Vehicle", subCategory: "Retro Entertainment Pop Culture", price: 1299, originalPrice: 1599 },
    { name: "SpongeBob SquarePants Patty Wagon", subCategory: "Nickelodeon Pop Culture", price: 999, originalPrice: 1199 },
    { name: "Rick and Morty Space Cruiser UFO", subCategory: "Adult Swim Pop Culture", price: 899, originalPrice: 1099 },
    { name: "The Simpsons Pink Family Sedan", subCategory: "The Simpsons Pop Culture", price: 999, originalPrice: 1299 },
    { name: "Nintendo Super Mario Standard Kart", subCategory: "Nintendo Pop Culture", price: 1199, originalPrice: 1399 },
    { name: "K.I.T.T. Pontiac Trans Am Knight Rider", subCategory: "Retro Entertainment Pop Culture", price: 1099, originalPrice: 1399 },
    { name: "Speed Racer Mach 5 Race Car", subCategory: "Anime Pop Culture", price: 1299, originalPrice: 1599 },
    { name: "James Bond Aston Martin DB5 Silver", subCategory: "Retro Entertainment Pop Culture", price: 1199, originalPrice: 1499 },
    { name: "The A-Team Custom GMC Panel Van", subCategory: "Retro Entertainment Pop Culture", price: 1099, originalPrice: 1299 },
    { name: "HALO UNSC Warthog All-Terrain", subCategory: "Microsoft HALO Pop Culture", price: 1199, originalPrice: 1499 }
  ]
};

// Seed Images rotation
const imagesList = {
  'Mainline': [
    '/images/seed/mainline_1.png',
    '/images/seed/mainline_2.png',
    '/images/seed/mainline_3.png'
  ],
  'Premium': [
    '/images/seed/premium_1.png',
    '/images/seed/premium_2.png',
    '/images/seed/premium_3.png'
  ],
  // Fallbacks using generated images in rotation
  'Treasure Hunts': [
    '/images/seed/mainline_1.png',
    '/images/seed/premium_2.png',
    '/images/seed/mainline_2.png',
    '/images/seed/premium_3.png'
  ],
  'Redline Club': [
    '/images/seed/premium_1.png',
    '/images/seed/mainline_1.png',
    '/images/seed/premium_3.png',
    '/images/seed/mainline_2.png'
  ],
  'Pop Culture': [
    '/images/seed/mainline_2.png',
    '/images/seed/premium_1.png',
    '/images/seed/mainline_3.png',
    '/images/seed/premium_2.png'
  ]
};

const colorsPool = [
  'Spectraflame Red', 'Spectraflame Blue', 'Chrome', 'Spectraflame Purple', 
  'Enamel Green', 'Candy Yellow', 'Gloss Black', 'Olympic White', 'Satin Grey'
];

const tagsPool = ['rare', 'hotwheels', 'diecast', 'collector', 'super-th', 'exclusive', 'retro', 'unopened'];

const descriptions = [
  "Highly-detailed 1:64 scale die-cast collector model. Exquisite craftsmanship with premium paint job and realistic alloy detailing. Must-have addition for any speedway enthusiast or serious collector.",
  "Premium casting featuring authentic decals, accurate details, and realistic paint finish. Fully licensed collector edition engineered with die-cast chassis and plastic speed-rims.",
  "Limited edition collectible casting with realistic wheel configurations, spectraflame livery, and detailed interiors. Part of the exclusive collector vault release.",
  "Ultra-rare casting, featuring premium graphics, die-cast components, and heavy-duty chassis structure. Perfect packaging and highly sought after by collectors worldwide."
];

async function seedData() {
  try {
    console.log("Database URI check:", process.env.MONGO_URI ? "URI Provided" : "No URI found in .env");
    
    // Connect DB
    await connectDB();

    console.log("Clearing Database collections...");
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log("Existing Product, Cart, and Order data successfully cleared.");

    const seedProducts = [];

    // Loop through each category and build 16 products
    for (const [categoryName, templates] of Object.entries(productTemplates)) {
      const categoryImages = imagesList[categoryName];

      templates.forEach((tmpl, index) => {
        // Deterministic fields based on index
        const imageFile = categoryImages[index % categoryImages.length];
        const desc = descriptions[index % descriptions.length];
        
        const discountPct = tmpl.originalPrice 
          ? Math.round(((tmpl.originalPrice - tmpl.price) / tmpl.originalPrice) * 100) 
          : 0;

        const ratingVal = parseFloat((4.0 + Math.random() * 1.0).toFixed(1));
        const reviewsCount = Math.floor(5 + Math.random() * 95);
        const stockQty = Math.floor(Math.random() * 45) + 5; // 5 to 50 in stock

        // Colors selection
        const c1 = colorsPool[(index) % colorsPool.length];
        const c2 = colorsPool[(index + 3) % colorsPool.length];

        // Tags
        const t1 = tagsPool[(index) % tagsPool.length];
        const t2 = tagsPool[(index + 2) % tagsPool.length];

        const productDoc = {
          name: tmpl.name,
          description: desc,
          brand: "Hot Wheels",
          category: categoryName,
          subCategory: tmpl.subCategory,
          price: tmpl.price,
          originalPrice: tmpl.originalPrice,
          discountPercentage: discountPct,
          images: [imageFile],
          thumbnail: imageFile,
          stock: stockQty,
          rating: ratingVal,
          totalReviews: reviewsCount,
          colors: [c1, c2],
          sizes: ['1:64'],
          seller: "HotWheels Vault",
          tags: ['hotwheels', t1, t2],
          featured: index < 3, // first 3 of each category are featured
          isTrending: index === 0 || index === 5, // some are marked trending
          specifications: {
            "Scale": "1:64",
            "Body Material": "Die-cast Metal",
            "Chassis": categoryName === 'Premium' || categoryName === 'Redline Club' ? "Metal" : "Plastic",
            "Wheels Type": categoryName === 'Premium' || categoryName === 'Redline Club' ? "Real Riders Rubber" : "Acetate Plastic",
            "Release Year": "2024",
            "Condition": "Mint in original packaging (MOC)"
          }
        };

        seedProducts.push(productDoc);
      });
    }

    console.log(`Inserting ${seedProducts.length} new Hot Wheels products...`);
    const inserted = await Product.insertMany(seedProducts);
    console.log(`Seeding Completed! Successfully inserted ${inserted.length} product listings.`);
    
    // Close db connection
    mongoose.connection.close();
    console.log("Mongoose connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Critical Seeding Error:", err);
    process.exit(1);
  }
}

seedData();
