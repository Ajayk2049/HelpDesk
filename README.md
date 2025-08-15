# 🆘 HelpDesk

> A smart AI + Human hybrid support ticketing system.

---

## 🛠 Tech Stack & Dependencies

<p align="center">
  
<!-- Frontend -->
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Redux%20Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Socket.io%20Client-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
<img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" />

<!-- Backend -->
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
<img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
<img src="https://img.shields.io/badge/BcryptJS-E34F26?style=for-the-badge&logo=javascript&logoColor=white" />
<img src="https://img.shields.io/badge/JSON%20Web%20Tokens-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

<!-- Utilities -->
<img src="https://img.shields.io/badge/CORS-FF6F00?style=for-the-badge&logo=javascript&logoColor=white" />
<img src="https://img.shields.io/badge/dotenv-000000?style=for-the-badge&logo=dotenv&logoColor=white" />
<img src="https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white" />

<!-- AI -->
<img src="https://img.shields.io/badge/Google%20Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />

</p>

---

## 📌 About the Project

HelpDesk is a **real-time AI + Human hybrid support platform**.  
It allows customers to create support tickets, interact with an AI for quick solutions, and escalate to human support agents when needed.

---

## 📸 Screenshots


![HomePage](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/homePage.png?raw=true)  
![Pricing](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/pricingPage.png?raw=true)  
![SignUP](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/signUp.png?raw=true)
![LogIn](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/Login.png?raw=true)
![ClientDashboard](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/ClientDashboard.png?raw=true)
![SupportDashboard](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/supportDashboard.png?raw=true)
![AdminDashboard](https://github.com/Ajayk2049/HelpDesk/blob/main/ScreenShots/AdminDashboard.png?raw=true)

---

## 🎯 Features

- **User Registration & Login** — Secure JWT authentication.
- **Ticket Creation** — Clients can create tickets with a topic.
- **AI Auto-Response** — Uses **Google Gemini 2.0 Flash** for instant replies.
- **Agent Request System** — If AI response is unsatisfactory, user can request a human agent.
- **Admin Panel** — Assign support agents based on skills.
- **Agent Handling** — Once assigned, AI stops replying, only the human agent responds.
- **Ticket Closing** — Agents can mark tickets as resolved.
- **Real-Time Messaging** — Powered by Socket.io for instant communication.

---

## 📂 Project Structure

**Backend**
Backend/

config/ # DB connection

controllers/ # All request handlers

middleware/ # Auth & admin middlewares

models/ # Mongoose schemas

routes/ # API routes

utils/ # Helper functions

server.js # Main backend entry point

.env # Environment variables

package.json


**Frontend**

Frontend/

public/ # Static assets

src/

assets/ # Images/icons

components/ # Reusable UI parts

pages/ # All app pages

redux/ # State management

App.jsx # Root component

main.jsx # App entry point

index.css # Global styles

package.json


---

## ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/helpdesk.git
cd helpdesk
cd Backend
npm install

**Create .env file in /Backend:**
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000

**Run backend in dev mode:**
npm run dev

**Frontend Setup**
cd ../Frontend
npm install
npm run dev

**🧠 AI Model Used**

Google Gemini 2.0 Flash — Fast, context-aware AI for customer support.

**📌 Notes**

Make sure backend is running before starting frontend.

WebSocket connection requires both servers to be active.

**⌚ Future features planned:**

File & image sharing

Audio/video call support

Screen sharing
