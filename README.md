# STEM Forge - Lesson Plan Generator

<div align="center">

![STEM Forge Logo](Front-End/Images/Hompage%20features/a1.png)

**A comprehensive web-based lesson plan generator for secondary school robotics and engineering education**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)]()

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Pages Overview](#-pages-overview)
- [API Documentation](#-api-documentation)
- [Android App (Capacitor)](#-android-app-capacitor)
- [Build & Deployment](#-build--deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**STEM Forge** is a comprehensive web-based lesson plan generator designed specifically for **secondary school robotics and engineering education**. The application emphasizes **experiential learning**, the **Engineering Design Process (EDP)**, and **safety protocols** while providing educators with ready-to-use, customizable lesson plans.

Whether you're teaching basic electronics, programming, or mechanical design, STEM Forge generates structured, EDP-aligned lesson plans in seconds.

---

## ✨ Key Features

- 📚 **Interactive Lesson Plan Generator** — Select class level, term, subject, and generate EDP-aligned lesson plans
- 🤖 **AI-Powered Generation** — Uses Groq LLM to create high-quality, context-aware lesson content
- 🦾 **Robotics-Focused Curriculum** — Specialized content for robotics, electronics, programming, mechanics, and more
- 🔧 **Engineering Design Process Integration** — Every lesson follows **Ask → Imagine → Plan → Create → Test & Improve**
- ⚠️ **Safety Protocols** — Embedded safety guidelines for every subject area
- 📱 **Responsive Design** — Works seamlessly on desktop, tablet, and mobile devices
- 🌗 **Light/Dark Theme** — User-friendly theme toggle
- 📊 **Dashboard** — Track lesson plans, students, and attendance
- 👥 **Attendance Management** — Built-in attendance tracking
- 🗂️ **Multi-Page Structure** — Home, About, Services, AI Generator, Attendance, Contact, and more
- 📱 **Android App** — Native Android app via Capacitor
- 🔐 **Authentication** — Secure user authentication and authorization
- 💾 **Backend API** — RESTful API with Express, MongoDB, and structured controllers

---

## 🛠️ Tech Stack

### Front-End
| Technology | Purpose |
|-----------|---------|
| **HTML5** | Markup & structure |
| **CSS3** (modular) | Styling (variables, base, layout, components, pages) |
| **Vanilla JavaScript (ES6+)** | Client-side logic |
| **LocalStorage API** | Client-side data persistence |
| **Capacitor** | Android native wrapper |

### Back-End
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB / Mongoose** | Database & ODM |
| **Groq API** | AI lesson generation |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **express-rate-limit** | API rate limiting |
| **dotenv** | Environment configuration |

---

## 📁 Project Structure

```
STEM-Forge/
│
├── Front-End/
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── theme-toggle.css
│   │   ├── layout/
│   │   │   ├── nav.css
│   │   │   ├── footer.css
│   │   │   ├── grid.css
│   │   │   └── container.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── forms.css
│   │   │   ├── tables.css
│   │   │   ├── modals.css
│   │   │   ├── alerts.css
│   │   │   ├── badges.css
│   │   │   └── timeline.css
│   │   └── pages/
│   │       ├── dashboard.css
│   │       ├── ai.css
│   │       ├── scheme.css
│   │       ├── attendance.css
│   │       ├── about.css
│   │       ├── services.css
│   │       ├── contact.css
│   │       └── coming-soon.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── core/
│   │   │   ├── config.js
│   │   │   ├── api.js
│   │   │   ├── storage.js
│   │   │   ├── theme.js
│   │   │   └── utils.js
│   │   ├── components/
│   │   │   ├── nav.js
│   │   │   ├── display.js
│   │   │   └── modals.js
│   │   └── pages/
│   │       ├── dashboard.js
│   │       ├── ai.js
│   │       ├── scheme.js
│   │       ├── attendance.js
│   │       └── contact.js
│   │
│   ├── Images/
│   │   └── Hompage features/
│   │       ├── a1.png
│   │       ├── a2.png
│   │       ├── a3.png
│   │       └── a4.png
│   │
│   ├── android/                  # Android native (Capacitor) project
│   │
│   ├── index.html                # Main generator page (home)
│   ├── about.html
│   ├── ai-generate.html
│   ├── attendance.html
│   ├── coming-soon.html
│   ├── contact.html
│   ├── exams.html
│   ├── pricing.html
│   ├── scheme.html
│   ├── services.html
│   └── virtual.html
│
Back-End/
├── firebase-service-account.json   (your secret file)
├── .env
├── package.json                    (updated)
├── server.js                       (updated)
└── src/
    ├── config/
    │   ├── firebase.js             (✅ already done)
    │   └── firestore.js            (NEW)
    ├── middleware/
    │   └── auth.js                 (✅ already updated)
    ├── models/
    │   ├── baseModel.js            (NEW)
    │   ├── User.js                 (REWRITTEN)
    │   ├── Student.js              (NEW)
    │   ├── Lesson.js               (REWRITTEN)
    │   ├── Scheme.js               (NEW)
    │   └── Attendance.js           (REWRITTEN)
    ├── routes/
    │   ├── generate.js
    │   ├── ai-generate.js
    │   ├── students.js
    │   ├── lessons.js
    │   ├── schemes.js
    │   ├── auth.js
    │   ├── attendance.js
    │   └── subjects.js
    ├── controllers/
    │   └── ... (not yet migrated)
    ├── services/
    │   └── ...
    └── utils/
        └── ...

```

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account)
- **Groq API Key** — [Get one here](https://console.groq.com/)
- **Git** — [Download here](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stem-forge.git
cd stem-forge
```

---

### 2. Back-End Setup

```bash
# Navigate to the backend directory
cd Back-End

# Install dependencies
npm install

# Create a .env file
touch .env
```

Add the following variables to your **`Back-End/.env`** file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/stem-forge

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Start the backend:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be running at `http://localhost:5000`

---

### 3. Front-End Setup

```bash
# Navigate to the frontend directory
cd ../Front-End

# (Optional) Start a simple HTTP server
# Using Python 3
python3 -m http.server 8000

# OR using Node's http-server
npx http-server -p 8000

# OR using VS Code's "Live Server" extension
```

Open your browser and navigate to:

```
http://localhost:8000
```

---

## ⚙️ Configuration

### Front-End API Endpoint

Update the API base URL in **`Front-End/js/core/config.js`**:

```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  // ... other config
};
```

### Theme Toggle

The application supports **light and dark themes**. Users can toggle the theme via the UI; the preference is saved to `localStorage`.

---

## 📖 Usage

### Generating a Lesson Plan

1. Open the **Home** page (`index.html`)
2. Select the following options from the dropdowns:
   - **Class Level** (e.g., JSS 1, SSS 2)
   - **Term** (First, Second, Third)
   - **Subject** (Robotics, Electronics, Programming, etc.)
   - **Topic / Subtopic** (optional)
3. Click **"Generate Lesson Plan"**
4. The AI will generate a complete, EDP-aligned lesson plan
5. **Save**, **Print**, or **Export** the lesson plan

### Engineering Design Process (EDP)

Every generated lesson follows this structure:

```
Ask → Imagine → Plan → Create → Test & Improve
```

Each phase includes:
- **Learning objectives**
- **Materials needed**
- **Step-by-step activities**
- **Safety protocols** (where applicable)
- **Assessment rubrics**

---

## 📄 Pages Overview

| Page | File | Description |
|------|------|-------------|
| **Home / Generator** | `index.html` | Main lesson plan generator interface |
| **AI Generator** | `ai-generate.html` | Advanced AI-powered lesson creation |
| **Dashboard** | *(linked from nav)* | Overview of lesson plans, students, attendance |
| **Scheme of Work** | `scheme.html` | Manage termly/weekly schemes |
| **Attendance** | `attendance.html` | Track student attendance |
| **About** | `about.html` | About STEM Forge |
| **Services** | `services.html` | Available services |
| **Pricing** | `pricing.html` | Subscription plans |
| **Contact** | `contact.html` | Get in touch |
| **Virtual Lab** | `virtual.html` | Virtual robotics/engineering lab |
| **Exams** | `exams.html` | Exam preparation tools |
| **Coming Soon** | `coming-soon.html` | Placeholder for upcoming features |

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login & receive JWT |
| `POST` | `/auth/logout` | Logout |
| `GET`  | `/auth/me` | Get current user info |

### Lessons

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/lessons` | Get all lessons |
| `POST`   | `/lessons` | Create a new lesson |
| `GET`    | `/lessons/:id` | Get lesson by ID |
| `PUT`    | `/lessons/:id` | Update a lesson |
| `DELETE` | `/lessons/:id` | Delete a lesson |

### AI Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai-generate` | Generate lesson plan with AI |
| `POST` | `/generate` | Generic content generation |

### Schemes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/schemes` | Get all schemes |
| `POST`   | `/schemes` | Create new scheme |
| `GET`    | `/schemes/:id` | Get scheme by ID |
| `PUT`    | `/schemes/:id` | Update scheme |
| `DELETE` | `/schemes/:id` | Delete scheme |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/students` | Get all students |
| `POST`   | `/students` | Add new student |
| `GET`    | `/students/:id` | Get student by ID |
| `PUT`    | `/students/:id` | Update student |
| `DELETE` | `/students/:id` | Delete student |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/attendance` | Get attendance records |
| `POST` | `/attendance` | Mark attendance |

### Subjects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subjects` | Get all subjects |

> **Note:** All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

---

## 📱 Android App (Capacitor)

STEM Forge ships with a **native Android wrapper** built using [Capacitor](https://capacitorjs.com/).

### Build the Web Assets

```bash
# From the project root
npm run build
```

### Sync & Open Android Studio

```bash
# Sync web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

From Android Studio, you can build and run the app on an emulator or physical device.

> 📁 The Android project lives in **`Front-End/android/`**

---

## 🏗️ Build & Deployment

### Front-End Build

```bash
# From Front-End/
# Minify CSS
npx csso-cli css/**/*.css -o dist/

# Minify JS
npx terser js/**/*.js -o dist/

# OR use a bundler like Vite/Webpack
```

### Back-End Deployment

#### Option 1: Heroku
```bash
heroku create stem-forge-api
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set GROQ_API_KEY=your_key
git push heroku main
```

#### Option 2: Railway / Render / DigitalOcean
1. Connect your GitHub repo
2. Set environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

#### Option 3: Docker (recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t stem-forge-api .
docker run -p 5000:5000 --env-file .env stem-forge-api
```

---

## 🗺️ Roadmap

- [ ] PDF Export for lesson plans
- [ ] Multi-language support (i18n)
- [ ] Collaborative editing (real-time)
- [ ] Student progress analytics
- [ ] Integration with Google Classroom
- [ ] Offline mode (PWA)
- [ ] iOS app (via Capacitor)
- [ ] AI-powered quiz generation
- [ ] Voice-over lesson narration
- [ ] Parent/guardian portal

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a **Pull Request**

### Coding Style
- Use 2-space indentation for HTML/CSS/JS
- Use ES6+ module syntax for JavaScript
- Follow BEM naming convention for CSS classes
- Write meaningful commit messages

---

## 🐛 Bug Reports

If you find a bug, please open an issue with:
- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/OS info

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Acknowledgments

- **Your Name** — *Initial work* — [YourGitHub](https://github.com/your-username)

### Built With
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Groq](https://groq.com/) — AI inference
- [Capacitor](https://capacitorjs.com/)

---

## 📞 Contact

- **Project Link:** [https://github.com/your-username/stem-forge](https://github.com/your-username/stem-forge)
- **Email:** your.email@example.com
- **Website:** [https://stemforge.example.com](https://stemforge.example.com)

---

## 🙏 Support

If you find this project useful, please consider:
- ⭐ **Starring** the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code

---

<div align="center">

**Made with ❤️ for educators shaping the next generation of engineers**

</div>

---

## 📌 Quick Reference

### Common Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Run backend in dev mode |
| `npm start` | Run backend in production |
| `npx cap sync android` | Sync web → Android |
| `npx cap open android` | Open Android Studio |
| `mongod` | Start MongoDB locally |

### Environment Variables Cheat Sheet

| Variable | Required | Example |
|----------|----------|---------|
| `PORT` | No | `5000` |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/stem-forge` |
| `JWT_SECRET` | Yes | `random_secure_string` |
| `GROQ_API_KEY` | Yes | `gsk_...` |
| `NODE_ENV` | No | `development` |

---

> 💡 **Tip:** Bookmark this README and refer back to it whenever you need setup or deployment guidance!

---

**Happy Teaching! 🎓🔧🤖**

---
