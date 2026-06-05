# 🗼 Project France — Ma Belle Aventure

A cozy, vintage Parisian-themed full-stack MERN web app for planning your study abroad journey to France.

---

## ✨ Features

| Section | Description |
|---|---|
| 🏠 **Dashboard** | Departure countdown, overall progress, quick actions |
| ✓ **Pre-Departure Checklist** | Visa, documents, flights, health, insurance tasks |
| 🧳 **Packing Tracker** | Category progress bars, essential flags |
| 🛍 **Shopping Tracker** | Budget calculations, priority tagging |
| 🎯 **Summer Goals** | Custom categories, milestones, progress sliders |
| 🥐 **Meals & Recipes** | French & healthy recipe book, favourites |
| 🗣 **French Learning** | Vocabulary flashcards, phrases, grammar notes |
| 🗼 **Bucket List** | France experiences by priority & category |
| 📓 **Journal** | Mood-tagged entries, tags, location |
| 📌 **Notes** | Coloured sticky notes, pinning, categories |
| 📊 **Analytics** | Radial charts, bar charts, readiness score |
| ⚙️ **Settings** | Profile, departure date, destination |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)

### 1. Clone & Install

```bash
git clone <your-repo>
cd project-france

# Install root devDependencies
npm install

# Install server + client dependencies
npm run install-all
```

### 2. Environment Variables

The server `.env` is already created at `server/.env`. Edit it:

```env
MONGO_URI=mongodb://localhost:27017/project-france
JWT_SECRET=your_super_secret_key_change_this_please
PORT=5000
CLIENT_URL=http://localhost:3000
```

For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string.

### 3. Run in Development

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000`

### 4. Register & Get Started

1. Open `http://localhost:3000`
2. Click **S'inscrire** (Register)
3. Fill in your name, email, departure date, and destination
4. Default checklists, packing lists, goals, phrases, and bucket list items are **automatically seeded** for you!

---

## 📁 Project Structure

```
project-france/
├── server/
│   ├── index.js              # Express entry point
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── ChecklistItem.js
│   │   ├── PackingItem.js
│   │   ├── ShoppingItem.js
│   │   ├── Goal.js
│   │   ├── Meal.js           # Recipe + MealPlan
│   │   ├── French.js         # Vocabulary + Phrase + FrenchNote
│   │   ├── BucketListItem.js
│   │   ├── JournalEntry.js
│   │   └── Note.js
│   └── routes/
│       ├── auth.js
│       ├── settings.js
│       ├── checklist.js
│       ├── packing.js
│       ├── shopping.js
│       ├── goals.js
│       ├── meals.js
│       ├── french.js
│       ├── bucketlist.js
│       ├── journal.js
│       └── notes.js
│
└── client/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── context/
        │   ├── AuthContext.js
        │   └── ToastContext.js
        ├── styles/
        │   └── global.css     # Full design system
        ├── components/
        │   └── layout/
        │       ├── Sidebar.js
        │       └── PageHeader.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Checklist.js
            ├── Packing.js
            ├── Shopping.js
            ├── Goals.js
            ├── Meals.js
            ├── French.js
            ├── BucketList.js
            ├── Journal.js
            ├── Notes.js
            ├── Analytics.js
            └── Settings.js
```

---

## 🎨 Design System

The app uses a **vintage Parisian travel journal** aesthetic:

- **Palette**: Parchment cream (`#fdf6ec`), vintage rouge (`#8b1a1a`), terracotta, dusty rose
- **Dark sidebar**: Deep walnut brown (`#2c1f14`)
- **Typography**: Cormorant Garamond (display), Libre Baskerville (body), Dancing Script (accents), Courier Prime (mono labels)
- **Details**: Wax-seal stamps, airmail borders, ink-sketch motifs, paper texture backgrounds

---

## 🔧 API Endpoints

All routes are prefixed `/api/` and require `Authorization: Bearer <token>` except `/auth/login` and `/auth/register`.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| GET/POST | `/checklist` | Get / create items |
| POST | `/checklist/seed` | Load default items |
| GET/POST | `/packing` | Packing list |
| GET/POST | `/shopping` | Shopping list |
| GET/POST | `/goals` | Goals |
| GET/POST | `/meals/recipes` | Recipes |
| GET/POST | `/french/vocabulary` | Vocabulary |
| GET/POST | `/french/phrases` | Phrases |
| GET/POST | `/bucketlist` | Bucket list |
| POST | `/bucketlist/seed` | Load default bucket list |
| GET/POST | `/journal` | Journal entries |
| GET/POST | `/notes` | Notes |

---

## 🌸 Tips

- **Set your departure date** in Settings to activate the countdown clock in the sidebar
- **Load starter notes** on the Notes page for essential Paris info (emergency numbers, transport, banking tips)
- **Flashcard mode** on the French Learning page lets you study vocabulary interactively
- The **Analytics page** calculates a readiness score weighted by task importance

---

*La vie est faite de petits bonheurs — Life is made of small moments of happiness.* 🥐

```
        ___
       /   \
      | 🗼  |
      |     |
  ~~~~|_____|~~~~
  Project France
```
