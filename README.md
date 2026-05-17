# ⚡ IncidentIQ — AI-Powered Incident Dashboard

A production-grade DevOps monitoring dashboard that detects service failures in real-time and uses **Groq LLM (Llama 3)** to automatically analyze root causes and suggest fixes.

![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Groq AI](https://img.shields.io/badge/Groq-Llama3-FF6B35?logo=meta)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis)

## 🌐 Live Demo

**[View Live App](https://dev-incident-dashboard.vercel.app/)** | **[API Health](https://dev-incident-dashboard.onrender.com/api/health)**

## ✨ Features

- 🔍 **Real-time service monitoring** — checks every 30 seconds
- 🚨 **Automatic incident detection** — creates incidents when services go down
- 🤖 **AI root cause analysis** — Groq Llama 3 analyzes logs and suggests fixes
- 📊 **Response time charts** — visualize performance trends
- 🎯 **Demo mode** — trigger incidents to see AI analysis live
- 🔮 **Glassmorphism UI** — FAANG-level dark mode design with Framer Motion
- ⚡ **Redis caching** — fast data retrieval

## 🛠 Tech Stack

**Frontend:**
- React 19 + React Router
- Framer Motion (animations)
- Recharts (data visualization)
- Tailwind CSS (glassmorphism design)

**Backend:**
- Node.js + Express
- PostgreSQL (Supabase)
- Redis (Upstash)
- Groq AI API (Llama 3)
- node-cron (scheduled monitoring)

## 🏗️ Architecture
Frontend (Vercel)
↓
Backend API (Render)
↓
┌─────────────────────┐
│  Monitor Service    │ ← runs every 30s
│  checks all URLs    │
└────────┬────────────┘
↓
PostgreSQL (Supabase)
↓
Redis Cache (Upstash)
↓
Groq AI Analysis

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services | Get all monitored services |
| POST | /api/services | Add new service |
| POST | /api/services/:id/trigger-incident | Trigger demo incident |
| GET | /api/incidents | Get all incidents |
| POST | /api/incidents/:id/analyze | AI analyze incident |
| PUT | /api/incidents/:id/resolve | Resolve incident |
| GET | /api/metrics/stats/uptime | Get uptime stats |

## 🚀 Getting Started

```bash
git clone https://github.com/pranayg00/dev-incident-dashboard
cd dev-incident-dashboard
```

**Backend:**
```bash
cd server
npm install
cp ../../.env.example .env
# Add your credentials
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm start
```

## 🔑 Environment Variables

```env
DATABASE_URL=your_supabase_connection_string
REDIS_URL=your_upstash_redis_url
GROQ_API_KEY=your_groq_api_key
```

## 📌 Roadmap

- [ ] Slack/email alert notifications
- [ ] Custom monitoring intervals
- [ ] Multi-user support
- [ ] Kubernetes health checks
- [ ] Historical incident reports

## 📄 License

MIT License