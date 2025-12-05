🌐 Airbnb Clone – Full-Stack Node.js Web Application

A full-featured Airbnb-style property listing application built using Node.js, Express, MongoDB, EJS, Passport.js, Cloudinary, Mapbox, and advanced frontend validation.
This project includes authentication, property management, reviews, geocoding, dynamic search, automated loaders, category filtering, city validation, and a polished user experience.

////

🚀 Features

Property Listings
	•	Add, edit, delete listings
	•	Cloudinary image upload
	•	Mapbox geocoding + maps
	•	Categories (Trending, Rooms, Hill Stations etc.)
	•	Search by title, city, country, category

Authentication
	•	Register, Login, Logout
	•	Username & Email availability check
	•	Password strength checking

Reviews
	•	Add/delete reviews
	•	Prevent duplicate reviews by same user

UI/UX
	•	Loader animation
	•	Auto-hide flash messages
	•	Heart wishlist toggle
	•	Dynamic placeholders
	•	Responsive Bootstrap UI

Smart Search
	•	Navbar autocomplete suggestions
	•	Live search with instant redirect

City Validation
	•	Validates city truly belongs to selected country
	•	Auto-fills latitude/longitude
	•	Fetches real data from OpenStreetMap API
	•	Suggests cities as you type

🏗 Tech Stack

Backend: Node.js, Express.js, MongoDB, Mongoose, Passport.js, Joi
Frontend: EJS, Bootstrap, Vanilla JavaScript
APIs: Mapbox Geocoding, Cloudinary Uploads, OpenStreetMap Nominatim
📦 MVC Architecture (Model–View–Controller)

This project is structured using an MVC architecture, ensuring clean separation of concerns, scalability, and maintainability.

Models (M)

Located in:
/models/
  listing.js
  review.js
  user.js
  Responsibilities:
	•	MongoDB schemas & validation
	•	Managing relationships (listing → reviews, owner)
	•	Database operations

Views (V)
Located in:
/views/
  /layouts/
  /listings/
  /users/
  Responsibilities:
	•	EJS templates for frontend rendering
	•	Shared components (navbar, footer, flash messages, base layout)
	•	Beautiful UI using Bootstrap + custom CSS/JS

Controllers (C)

Located in:
/controllers/
  listings.js
  review.js
  user.js
  Responsibilities:
	•	Handles business logic
	•	Processes requests from routes
	•	Interacts with Models
	•	Returns responses to Views

Routes (Connect MVC)

Located in:
/routes/
  listings.js
  review.js
  user.js
  Responsibilities:
	•	Map URLs → controller functions
	•	Apply middleware (auth, ownership, validation)

Why MVC?
	•	Cleaner structure
	•	Easier debugging
	•	Scalable & maintainable
	•	Perfect for large production-ready apps

    🔑 Key Features Explained

Listings
	•	Auto-geocode location
	•	Upload images
	•	Edit images (replaces old Cloudinary file)
	•	Delete listings safely

Reviews
	•	One review per user
	•	Deletes associated reviews on listing deletion

Authentication
	•	Passport local strategy
	•	Auto-login on register
	•	AJAX username/email check

City Validation
	•	Uses OpenStreetMap API
	•	Ensures city belongs to chosen country
	•	Updates coordinates automatically
	•	Works on both “Add” and “Edit” listing pages

Search
	•	Live suggestions (AJAX)
	•	Intelligent placeholder animations
	•	Full search page

Loader
	•	Appears on load, form submit, link navigation

Flash Messages
	•	Auto-hide animation after 3 seconds


    🚀 Deployment

Works perfectly on:
	•	Render
	•	Railway
	•	DigitalOcean
	•	Vercel (Node server adapter)

Deployment Checklist
	•	Add environment variables
	•	Whitelist Cloudinary + Mapbox URLs
	•	Use MongoDB Atlas
