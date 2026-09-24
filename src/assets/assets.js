/**
 * Rent Rides — Centralized Static Assets & Temporary Development Data
 * Phase 1: Static assets and UI development mocks.
 * Note: Permanent fleet data will come from Supabase in later phases.
 */

export const assets = {
  brandName: "Rent Rides",
  tagline: "Drive Your Journey With Rent Rides",
  heroCar: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1400&q=80", // Lamborghini Huracan / Supercar
  heroInterior: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80", // Luxury car interior
  ctaCarSunset: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
};

export const carCategories = [
  {
    id: "sports",
    name: "Sports Cars",
    subtitle: "Feel the power",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80", // Porsche 911 GT / Sport
    count: 8,
  },
  {
    id: "suv",
    name: "SUVs",
    subtitle: "Go further",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80", // White Range Rover / Luxury SUV
    count: 14,
  },
  {
    id: "luxury",
    name: "Luxury Cars",
    subtitle: "Travel in style",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80", // Rolls-Royce / Bentley
    count: 6,
  },
  {
    id: "electric",
    name: "Electric Cars",
    subtitle: "Drive the future",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80", // Tesla Model S / EV
    count: 10,
  },
  {
    id: "vans",
    name: "Vans & MPVs",
    subtitle: "More space, more fun",
    image: "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=600&q=80", // Mercedes V-Class / Luxury Van
    count: 5,
  },
];

export const cars = [
  {
    id: 1,
    name: "Mercedes-Benz C-Class AMG",
    brand: "Mercedes-Benz",
    category: "Luxury",
    categoryId: "luxury",
    pricePerDay: 120,
    rating: 4.9,
    reviewsCount: 114,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 5,
    transmission: "Automatic",
    fuel: "Hybrid / Petrol",
    speed: "250 km/h",
    horsepower: "255 HP",
    mpg: "32 MPG",
    popular: true,
    description: "The Mercedes-Benz C-Class AMG strikes the ideal equilibrium between executive elegance and spirited performance. Features active suspension damping, MBUX digital widescreen cockpit, and panoramic sunroof.",
    features: [
      "GPS Navigation with Live Traffic",
      "Apple CarPlay & Android Auto",
      "Heated & Ventilated Leather Seats",
      "Adaptive Cruise Control & Lane Assist",
      "Burmester 3D Surround Sound",
      "360-Degree Parking Camera"
    ]
  },
  {
    id: 2,
    name: "Lamborghini Huracán EVO",
    brand: "Lamborghini",
    category: "Sports",
    categoryId: "sports",
    pricePerDay: 480,
    rating: 5.0,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 2,
    transmission: "7-Speed Dual-Clutch",
    fuel: "Premium Petrol",
    speed: "325 km/h",
    horsepower: "640 HP",
    mpg: "15 MPG",
    popular: true,
    description: "An exotic Italian masterpiece designed for visceral thrill. Natural V10 power, all-wheel steering, and aerodynamic styling that commands every street.",
    features: [
      "5.2L Naturally Aspirated V10",
      "Carbon Ceramic Brakes",
      "Sport Exhaust System",
      "Drive Mode Selector (Strada/Sport/Corsa)",
      "Digital Cockpit with Telemetry"
    ]
  },
  {
    id: 3,
    name: "Range Rover Sport HSE",
    brand: "Land Rover",
    category: "SUV",
    categoryId: "suv",
    pricePerDay: 195,
    rating: 4.8,
    reviewsCount: 76,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 5,
    transmission: "Automatic",
    fuel: "Diesel / Mild Hybrid",
    speed: "220 km/h",
    horsepower: "355 HP",
    mpg: "28 MPG",
    popular: true,
    description: "Peerless luxury meets commanding all-terrain capability. The Range Rover Sport delivers whisper-quiet motorway cruising and effortless off-road adventure.",
    features: [
      "Electronic Air Suspension",
      "Terrain Response 2 System",
      "Meridian Audio System",
      "Heated Steering Wheel & Armrests",
      "Wireless Phone Charger & 4-Zone Climate"
    ]
  },
  {
    id: 4,
    name: "Porsche 911 Carrera S",
    brand: "Porsche",
    category: "Sports",
    categoryId: "sports",
    pricePerDay: 320,
    rating: 4.9,
    reviewsCount: 94,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 4,
    transmission: "8-Speed PDK",
    fuel: "Petrol",
    speed: "308 km/h",
    horsepower: "443 HP",
    mpg: "24 MPG",
    popular: true,
    description: "The quintessential sports car icon. Precision German engineering with rear-engine balance, twin-turbocharged flat-six power, and timeless silhouette.",
    features: [
      "Sport Chrono Package",
      "Porsche Active Suspension Management",
      "PASM Sport Suspension",
      "Bose Surround Sound System",
      "Full Matrix LED Headlights"
    ]
  },
  {
    id: 5,
    name: "Tesla Model S Plaid",
    brand: "Tesla",
    category: "Electric",
    categoryId: "electric",
    pricePerDay: 180,
    rating: 4.9,
    reviewsCount: 130,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 5,
    transmission: "Single-Speed EV",
    fuel: "100% Electric (390 mi range)",
    speed: "322 km/h",
    horsepower: "1,020 HP",
    mpg: "120 MPGe",
    popular: false,
    description: "Tri-motor all-wheel drive with sub-2.0s 0-60 mph acceleration. Exceptional battery range, futuristic yoke steering, and cutting-edge autopilot technology.",
    features: [
      "Tri-Motor All-Wheel Drive",
      "Enhanced Autopilot Assistance",
      "17-Inch Cinematic Touchscreen",
      "22-Speaker Audio with Active Noise Cancellation",
      "Supercharging Network Access"
    ]
  },
  {
    id: 6,
    name: "BMW M4 Competition",
    brand: "BMW",
    category: "Sports",
    categoryId: "sports",
    pricePerDay: 210,
    rating: 4.8,
    reviewsCount: 68,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 4,
    transmission: "8-Speed M Steptronic",
    fuel: "Petrol",
    speed: "290 km/h",
    horsepower: "503 HP",
    mpg: "23 MPG",
    popular: false,
    description: "Track-ready dynamics in a bold luxury coupe. The M TwinPower Turbo inline 6-cylinder engine delivers explosive acceleration with everyday usability.",
    features: [
      "M Carbon Bucket Seats",
      "M Compound Brakes",
      "Harman Kardon Sound",
      "Head-Up Display with M View",
      "Active M Differential"
    ]
  },
  {
    id: 7,
    name: "Rolls-Royce Ghost Series II",
    brand: "Rolls-Royce",
    category: "Luxury",
    categoryId: "luxury",
    pricePerDay: 650,
    rating: 5.0,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 5,
    transmission: "Automatic",
    fuel: "Twin-Turbo V12",
    speed: "250 km/h",
    horsepower: "563 HP",
    mpg: "18 MPG",
    popular: false,
    description: "The pinnacle of automotive refinement. Effortless Magic Carpet Ride suspension, starlight headliner, and whisper-quiet handcrafted cabin luxury.",
    features: [
      "Bespoke Starlight Headliner",
      "Planar Suspension System",
      "Refrigerated Rear Console",
      "Power-Assisted Doors",
      "Lambswool Footmats"
    ]
  },
  {
    id: 8,
    name: "Mercedes-Benz V-Class Exclusive",
    brand: "Mercedes-Benz",
    category: "Vans",
    categoryId: "vans",
    pricePerDay: 160,
    rating: 4.7,
    reviewsCount: 55,
    image: "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1200&q=80"
    ],
    seats: 7,
    transmission: "Automatic 9G-TRONIC",
    fuel: "Diesel",
    speed: "205 km/h",
    horsepower: "239 HP",
    mpg: "35 MPG",
    popular: false,
    description: "First-class VIP group travel. Features conference seating configuration, folding luxury tables, rear entertainment screens, and massive luggage capacity.",
    features: [
      "7 VIP Leather Recliner Seats",
      "Dual Electric Sliding Doors",
      "Panoramic Glass Sunroof",
      "Rear Climate Control",
      "Burmester Surround Sound"
    ]
  }
];

export const features = [
  {
    id: "pricing",
    title: "Affordable Price",
    description: "Transparent competitive rates with no hidden fees or surprise charges.",
    badge: "Best Value"
  },
  {
    id: "safety",
    title: "Clean & Safe",
    description: "Every vehicle undergoes an exhaustive 50-point safety inspection & sanitation.",
    badge: "Certified"
  },
  {
    id: "support",
    title: "24/7 Support",
    description: "Dedicated concierge and roadside assistance available round the clock.",
    badge: "Always Here"
  },
  {
    id: "booking",
    title: "Easy Booking",
    description: "Reserve your chosen vehicle in under 2 minutes with instant confirmation.",
    badge: "Fast & Easy"
  }
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Choose Your Car",
    description: "Explore our curated fleet of sports, luxury, electric, and family vehicles."
  },
  {
    step: "02",
    title: "Select Your Dates",
    description: "Pick your preferred pickup and drop-off schedule along with delivery location."
  },
  {
    step: "03",
    title: "Request Your Booking",
    description: "Provide your basic driver details and customize your preferred protection package."
  },
  {
    step: "04",
    title: "Get Confirmation",
    description: "Receive instant electronic booking voucher with detailed key handover instructions."
  },
  {
    step: "05",
    title: "Enjoy Your Ride",
    description: "Collect your keys or receive doorstep delivery, then take to the open road with complete peace of mind."
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Tech Executive",
    location: "New York, USA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review: "Rent Rides made our coastal road trip completely unforgettable! The Porsche 911 was in pristine condition, and the digital pickup process was faster than any traditional car rental company."
  },
  {
    id: 2,
    name: "David Sterling",
    role: "Architect",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review: "The customer service is outstanding. Needed a Range Rover for a weekend client event on short notice, and they delivered it right to my hotel door immaculately sanitized."
  },
  {
    id: 3,
    name: "Elena Rostova",
    role: "Creative Director",
    location: "Dubai, UAE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review: "Renting the Mercedes C-Class AMG was smooth from start to finish. Transparent rates, zero surprise deposits, and 24/7 concierge support that actually responds within minutes."
  }
];
