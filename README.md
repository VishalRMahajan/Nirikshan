<p align="center">
  <img src="https://github.com/user-attachments/assets/1e7ceab6-443b-488d-af8f-ed17ec77cce0" alt="Food Ordering Website Logo">
</p>

<h1 align="center">Nirikshan: Real-Time Road Accident Detection System using YOLOv11 and CCTV Surveillance</h1>

**Nirikshan** is an AI-powered real-time accident detection system designed to revolutionize road safety. By leveraging advanced computer vision technology, Nirikshan detects vehicle collisions through CCTV footage and instantly notifies highway authorities, enabling swift emergency responses.

## 📝 Table of Contents

1. [Key Features](#key-features)
2. [Built With](#built-with)
3. [Getting Started Guide](#getting-started-guide)
4. [Running the Application](#running-the-application)
5. [How It Works](#how-it-works)
6. [System Architecture](#system-architecture)
7. [Methodology](#methodology)
8. [Performance Highlights](#performance-highlights-)
9. [Repository Structure](#repository-structure)
10. [License](#license)
11. [Credits & Acknowledgments](#credits--acknowledgments)
12. [Support & Contact Information](#support--contact-information)

## Key Features ✨
- **Real-Time Detection:** Powered by YOLO-based object detection for accurate identification of vehicle collisions.
- **Instant Alerts:** Sends immediate notifications to control centers via WebSocket integration.
- **Verification Workflow:** Provides an intuitive dashboard for authorities to review and act on detected incidents.
- **Scalable Design:** Seamlessly integrates with existing CCTV infrastructure for widespread deployment.

## Built With

<p>
  <img src="https://skillicons.dev/icons?i=nextjs,fastapi,postgres,tailwindcss,prisma,pytorch" alt="Tech Stack" />
</p>

## 🚀 Getting Started Guide

Follow these steps to set up the project on your local machine.

### 📦 Prerequisites

Ensure you have the following tools installed:

- ✅ **Node.js** (v14 or later)  
- ✅ **npm** or **yarn**  
- ✅ **Python** (v3.8 or later)  
- ⚡ **CUDA Toolkit** (for GPU acceleration, optional)

> 💡 *Tip: Keep your packages up-to-date for best results.*

### 🔧 Installing CUDA

For GPU acceleration, install CUDA on your system.  [Watch Tutorial](https://www.youtube.com/watch?v=nATRPPZ5dGE) for step-by-step guidance.  
Ensure your CUDA version matches your PyTorch build.

## 🛠️ Installation Steps

### 1. 📁 Clone the Repository

```bash
git clone https://github.com/VishalRMahajan/Nirikshan.git
cd Nirikshan
```

### 2. ⚙️ Set Up the Frontend

Navigate to the frontend folder and install the dependencies:

```bash
cd frontend
npm install
```

### 3. 🔐 Configure Environment Variables (Frontend Only)

1. **Generate Authentication Secret**  
   Make sure you are in the `frontend` directory before running the following command:
   ```bash
   npx auth secret
   ```

2. **Set Up Google OAuth**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project and configure OAuth consent.
   - Set the Authorized Redirect URI to:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

3. **Create or Update the Following Files in the `frontend` Directory:**

   `.env.local`
   ```
   AUTH_SECRET= # Automatically added by `npx auth`
   AUTH_GOOGLE_ID= # Your Google Client ID
   AUTH_GOOGLE_SECRET= # Your Google Client Secret
   ```

   `.env`
   ```
   DATABASE_URL= # Your Postgres database connection string
   ```

4. **Database Setup**  
   Make sure you are in the `frontend` directory before running the following commands:
   ```bash
   cd frontend
   pnpm exec prisma migrate dev
   pnpm exec prisma generate
   ```

### 4. 🔌 Set Up the Backend

1. **Create a Virtual Environment**  
   ```bash
   cd ../backend
   python -m venv venv

   # For Windows:
   venv\Scripts\activate

   # For macOS/Linux:
   source venv/bin/activate
   ```

2. **Install PyTorch in Virtual Environment**  
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
   ```

3. **Install Backend Dependencies**  
   ```bash
   pip install -r requirements.txt
   ```

## ▶️ Running the Application

### 1. 🔙 Start the Backend (FastAPI)

```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`.

### 2. 🌐 Start the Frontend (Next.js)

```bash
cd ../frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## How It Works 🚦

Nirikshan is an AI-powered accident detection system that leverages advanced computer vision technology to identify vehicle collisions in real-time and facilitate rapid emergency response. Here's how it works:

### **Step-by-Step Process**

1. **Accident Happens**  
   A crash occurs on the highway, captured by CCTV cameras installed at strategic locations.

2. **CCTV Captures Footage**  
   The video feed is processed using a YOLO-based vehicle collision detection model to identify accidents with high accuracy.

3. **Instant Alert Sent**  
   Upon detecting an accident, the backend system sends an immediate alert to highway authorities via WebSocket integration.

4. **Verification and Response**  
   Authorities verify the incident through an intuitive dashboard and dispatch emergency services to the scene.

## **System Architecture**
<p align="center">
  <img src="https://github.com/user-attachments/assets/1d0be4ae-d18b-4758-893a-3cb333f09d44" alt="Food Ordering Website Logo">
</p>

## Methodology
<p align="center">
  <img src="https://github.com/user-attachments/assets/61691468-cf4b-4e6e-9e26-22e4343c7a42" alt="Food Ordering Website Logo">
</p>

## Performance Highlights 📊

<img src="https://github.com/user-attachments/assets/af36475e-cfa9-45fc-a3b6-1121faf12243" alt="YOLOv11 Performance" style="width:100%; max-width:900px;"/>

### 🔍 Key Performance Metrics

- **mAP@50:** 99% (excellent object detection)
- **mAP@50-95:** 89.3% (strong performance at stricter thresholds)
- **Precision:** 96.8% (low false positives)
- **Recall:** 96.4% (high true positive rate)

### 💡 Class Performance Highlights

- All classes achieve ~99% mAP@50
- Strongest performance: `car_object_accident` (97.6% mAP@50-95)

### 📈 Training Progression

- 📉 Consistent decrease in loss values (box, classification, DFL)
- 📊 Steady improvement in precision and recall throughout training
- ✅ No signs of overfitting (validation metrics track closely with training)

## 🗂️ Repository Structure

The project is divided into two main parts:

1. **Frontend** (`/frontend`):  
   - Built with **Next.js** and **TypeScript**.
   - Handles the user interface, routing, and authentication.
   - Includes Prisma for database interaction.
   - Key files:
     - `.env.local`: Environment variables for the frontend (Google OAuth, Prisma settings).
     - `.env`: Additional environment variables for general frontend configuration.
     - `pages/`: App pages (e.g., `index.tsx`, `login.tsx`).
     - `components/`: Reusable components.
     - `prisma/`: Prisma schema and migration files.

2. **Backend** (`/backend`):  
   - Built with **FastAPI**.
   - Manages APIs, authentication, and database interaction.
   - Key files:
     - `app/`: Core app logic (routes, models, and schemas).
     - `requirements.txt`: Python dependencies.

## 📄 License  
This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

## 🙌 Credits & Acknowledgments
Special thanks to [Roboflow](https://universe.roboflow.com/deteccion-h92uo/deteccion_accidentes) for providing the dataset used for training the model. 

## 📬 Support & Contact Information
For any queries, feedback, or support, feel free to reach out at: **vism06@gmail.com**
