# 🎓 GPS Kunda Smart Quiz Portal

A professional, mobile-first Learning Management System (LMS) and Quiz assessment platform designed for **GPS No. 4 Kunda**. This application provides a seamless experience for students to take assessments and for teachers to manage educational content.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)

---

## 🚀 Key Features

### 👨‍🎓 For Students
- **Smart Portal**: Easy entry system for students to access assigned quizzes.
- **Interactive Quiz Interface**: Clean, focused UI for taking tests with real-time feedback.
- **Math & Science Support**: Built-in LaTeX rendering using **KaTeX** for complex mathematical formulas and scientific notations.
- **Live Leaderboard**: Real-time rankings to encourage healthy competition among students.
- **Animated Results**: Celebration effects with **Canvas Confetti** and detailed performance breakdowns.

### 👩‍🏫 For Teachers
- **Advanced Dashboard**: Comprehensive overview of student performance and quiz analytics.
- **Dynamic Quiz Creator**: Build quizzes with multiple-choice questions easily.
- **Bulk Data Import**: Support for importing questions and student data via CSV using **PapaParse**.
- **Unit Management**: Organize assessments by curriculum units and subjects.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://reactjs.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Mathematics**: [KaTeX](https://katex.org/) & [React-KaTeX](https://github.com/talyssonoc/react-katex)
- **Data Parsing**: [PapaParse](https://www.papaparse.com/)
- **Visual Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio**: [Use-Sound](https://github.com/joshwcomeau/use-sound)

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Junaid6432/QuizApp.git
   cd QuizApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components (Buttons, MathText, etc.)
├── context/        # Global state management (QuizContext)
├── pages/          # Full-page components (Dashboard, Quiz, Leaderboard)
├── constants/      # Static data (College/School details)
├── utils/          # Helper functions (File handling, validation)
└── index.css       # Global styles and Tailwind imports
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the GPS Kunda Smart Portal, please fork the repo and submit a pull request.

## 📄 License

This project is licensed under the MIT License.

---
Developed with ❤️ by **Junaid Ur Rehman**
