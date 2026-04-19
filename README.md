# 🛠️ CivicLens

A web-based platform that allows users to report public issues such as garbage dumps, potholes, broken roads, and more by uploading images. The system automatically generates a formal complaint and sends it to the appropriate government authority.

---

## 🚀 Features

- 📸 Upload images of public issues
- 📍 Automatic location detection using latitude & longitude
- 🧠 AI-powered issue detection and complaint generation
- 📧 Automatic email sending to responsible department
- 🗂️ Complaint tracking dashboard
- 🔐 User authentication (NextAuth)
- 🧾 Complaint history with details

---

## 🧩 How It Works

1. User uploads an image of a public issue  
2. System analyzes the image using AI  
3. Location is detected using reverse geocoding  
4. AI generates:
   - Issue description  
   - Responsible department  
   - Formal complaint email  
5. Email is automatically sent via Gmail API  
6. Complaint is stored in database  
7. User can view all previous complaints in dashboard  

---

## 🏗️ Tech Stack

- **Frontend:** Next.js
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Authentication:** NextAuth
- **AI Integration:** Google Gemini API
- **Geolocation:** LocationIQ API
- **Email Service:** Gmail API

---

## 📁 Project Structure
/app/api
├── complaints/route.js # Fetch user complaints
├── dept/route.js # Generate department + complaint using AI
├── process-image/route.js # Analyze uploaded image
├── send-email/route.js # Send email + save complaint

/lib
├── mongodb.js # DB connection
├── authOptions.js # Auth config

/models
├── Complaints.js
├── Users.js



---

## 🔐 Authentication

- Uses NextAuth for session management
- Only authenticated users can:
  - Submit complaints
  - View dashboard
  - Send emails

---

## 📬 Complaint Flow

### 1. Image Processing API

- Takes base64 image
- Uses Gemini AI to:
  - Detect issue type
  - Suggest department
  - Generate complaint template

---

### 2. Department Detection API

- Converts coordinates → address using LocationIQ
- Uses AI to generate structured JSON:
  - Department name
  - Official email
  - Complaint subject & body

---

### 3. Send Email API

- Sends complaint via Gmail API
- Saves complaint in MongoDB
- Generates unique complaint number

---

### 4. Fetch Complaints API

- Retrieves all user complaints
- Sorted by latest first
- Displays in dashboard

---

## 📊 Dashboard Features

- View all submitted complaints
- Track complaint number
- See:
  - Department
  - Location
  - Description
  - Date

---

## ⚙️ Environment Variables

--Create a `.env.local` file:
 - MONGODB_URI=your_mongodb_connection
 - NEXTAUTH_SECRET=your_secret
 - GOOGLE_CLIENT_ID=your_google_client_id
 - GOOGLE_CLIENT_SECRET=your_google_client_secret
 - GEMINI_API_KEY=your_gemini_key
 - LOCATIONIQ_API_KEY=your_locationiq_key


---

## 🧠 AI Usage

- Image analysis for detecting issues
- Smart complaint generation
- Department classification (MCD, PWD, etc.)

---

## 📌 Example Use Cases

- 🗑️ Garbage on roads
- 🕳️ Potholes
- 🚧 Broken roads
- 🚰 Water leakage
- 🏚️ Damaged public infrastructure

---

## 🔮 Future Improvements

- 📱 Mobile app support
- 🗺️ Map-based complaint visualization
- 🔔 Status updates from authorities
- 🤖 Better AI classification
- 📊 Analytics dashboard

---

## 🤝 Contribution

Feel free to contribute by:
- Improving UI/UX
- Enhancing AI prompts
- Adding new features

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 💡 Author

Developed to simplify civic issue reporting and improve communication between citizens and authorities.

