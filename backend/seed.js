require('dotenv').config();

const mongoose = require('mongoose');
const Expert = require('./src/models/Expert');

const experts = [
  {
    name: "Arjun Mehta",
    category: "Full Stack",
    experience: 5,
    hourlyRate: 50,
    amount: 70, // hourlyRate + base fee
    rating: 4.8,
    bio: "MERN Stack developer with startup experience.",
    availableSlots: [
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "2:00 PM - 3:00 PM",
      "4:00 PM - 5:00 PM"
    ]
  },
  {
    name: "Priya Das",
    category: "Data Science",
    experience: 8,
    hourlyRate: 80,
    amount: 100,
    rating: 4.9,
    bio: "ML Engineer specializing in NLP and AI systems.",
    availableSlots: [
      "9:00 AM - 10:00 AM",
      "1:00 PM - 2:00 PM",
      "3:00 PM - 4:00 PM"
    ]
  },
  {
    name: "Rahul Sharma",
    category: "UI/UX Design",
    experience: 4,
    hourlyRate: 40,
    amount: 60,
    rating: 4.5,
    bio: "UI/UX designer focused on mobile experiences.",
    availableSlots: [
      "11:00 AM - 12:00 PM",
      "12:00 PM - 1:00 PM",
      "5:00 PM - 6:00 PM"
    ]
  },
  {
    name: "Snehil Paul",
    category: "DevOps",
    experience: 6,
    hourlyRate: 70,
    amount: 90,
    rating: 4.7,
    bio: "Cloud and CI/CD expert with AWS experience.",
    availableSlots: [
      "10:00 AM - 11:00 AM",
      "3:00 PM - 4:00 PM",
      "6:00 PM - 7:00 PM"
    ]
  },
  {
    name: "Ananya Roy",
    category: "Full Stack",
    experience: 3,
    hourlyRate: 35,
    amount: 55,
    rating: 4.2,
    bio: "Frontend-focused React developer.",
    availableSlots: [
      "9:00 AM - 10:00 AM",
      "11:00 AM - 12:00 PM",
      "1:00 PM - 2:00 PM"
    ]
  },
  {
    name: "Karan Verma",
    category: "Cyber Security",
    experience: 7,
    hourlyRate: 90,
    amount: 110,
    rating: 4.9,
    bio: "Security analyst and penetration tester.",
    availableSlots: [
      "2:00 PM - 3:00 PM",
      "4:00 PM - 5:00 PM",
      "7:00 PM - 8:00 PM"
    ]
  },
  {
    name: "Neha Kapoor",
    category: "Mobile Development",
    experience: 5,
    hourlyRate: 60,
    amount: 80,
    rating: 4.6,
    bio: "React Native developer building scalable apps.",
    availableSlots: [
      "10:00 AM - 11:00 AM",
      "12:00 PM - 1:00 PM",
      "5:00 PM - 6:00 PM"
    ]
  },
  {
    name: "Vikram Singh",
    category: "Backend Development",
    experience: 9,
    hourlyRate: 100,
    amount: 120,
    rating: 5.0,
    bio: "Node.js backend architect and API specialist.",
    availableSlots: [
      "9:00 AM - 10:00 AM",
      "2:00 PM - 3:00 PM",
      "6:00 PM - 7:00 PM"
    ]
  },
  {
    name: "Riya Sen",
    category: "Product Management",
    experience: 6,
    hourlyRate: 75,
    amount: 95,
    rating: 4.7,
    bio: "Product strategist with SaaS experience.",
    availableSlots: [
      "11:00 AM - 12:00 PM",
      "1:00 PM - 2:00 PM",
      "4:00 PM - 5:00 PM"
    ]
  },
  {
    name: "Aditya Jain",
    category: "AI Engineering",
    experience: 4,
    hourlyRate: 85,
    amount: 105,
    rating: 4.8,
    bio: "AI developer building LLM-powered systems.",
    availableSlots: [
      "10:00 AM - 11:00 AM",
      "3:00 PM - 4:00 PM",
      "5:00 PM - 6:00 PM"
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing data
    await Expert.deleteMany({});

    // Insert new data with 'amount' field
    await Expert.insertMany(experts);

    console.log("Database Seeded Successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();