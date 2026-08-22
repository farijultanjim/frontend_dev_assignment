# NexusChat — Real-Time Messaging Platform

> **Frontend Developer Take-Home Assignment Submission**  
> Built with Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Socket.io Client, and Framer Motion.

---

## 🌟 Submission Overview

This repository contains the complete three-part implementation for the Take-Home Assignment:

- **Part 1: API Documentation & Feature Implementation**
  - **API Documentation**: Formally specified REST and WebSocket protocol in [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) and an interactive in-app explorer at [`/docs`](http://localhost:3000/docs).
  - **Full Chat Application**: Real-time 1-on-1 and group messaging with smart scroll-lock, cursor pagination, optimistic UI updates, and group administration at [`/chat`](http://localhost:3000/chat).
- **Part 2: Creative Showcase Landing Page**
  - High-end, responsive landing page featuring an interactive live sandbox chat widget, Bento Grid feature deep dives, and architectural diagrams at [`/`](http://localhost:3000/).
- **Part 3: Thought Process & Engineering Architecture**
  - Detailed write-up covering architectural rationale, state management trade-offs, live API quirks and edge cases, honest AI usage disclosure, and future roadmap in [`docs/THOUGHT_PROCESS.md`](./docs/THOUGHT_PROCESS.md).

---

## 🚀 Quick Start & Local Run

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ recommended
- **Package Manager**: `npm`, `yarn`, or `pnpm`

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 👥 Test Personas (Quick Login)

When logging in at [`/login`](http://localhost:3000/login), you can click on any test persona card for instant pre-filling:

| Persona | Name | Phone Number |
| :--- | :--- | :--- |
| **Lead Developer** | Alex Johnson | `+12345678901` |
| **Product Manager** | Sarah Connor | `+12345678902` |
| **Frontend Engineer** | Elena Rostova | `+8801700000001` |

*Note: Entering any other phone number will automatically create and register a new user.*

---

## 🛠️ Key Technical Features & Edge Case Handling

1. **Smart Auto-Scroll Engine**:
   - Auto-scrolls to the newest message upon initial entry and when the current user sends a message.
   - Detects when the user has scrolled up to read earlier history and locks the viewport without force-scrolling.
   - Displays a floating `↓ New messages below` notification button when peer messages arrive while scrolled up.
2. **Cursor Pagination with Anchor Preservation**:
   - Older messages are fetched with `before=<oldest_message_id>`.
   - Scroll position is mathematically preserved (`container.scrollTop += heightDifference`) to prevent jumping.
3. **Duplex WebSocket & Resilient REST Fallback**:
   - Socket.io listens for `message:new` and `conversation:updated` in real time with automatic reconnect.
   - Outgoing messages use optimistic UI updates with immediate feedback.
4. **Group Governance**:
   - Group creation requires a minimum of 2 other participants (3 total members).
   - Admin capabilities include group renaming, member additions, promotions to admin, and member removals.
5. **Senior Power-User Touches**:
   - Global `Cmd/Ctrl + K` Command Palette.
   - Zero-dependency Web Audio API synthesizer for sound effects (with mute toggle).
   - Rich Markdown code block formatting and inline emoji reactions.

---

## 📚 Deliverable Files

- [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) — Comprehensive API reference and Socket.io protocol.
- [`docs/THOUGHT_PROCESS.md`](./docs/THOUGHT_PROCESS.md) — Architectural reasoning, trade-offs, API audit, and AI disclosure.
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — Step-by-step task breakdown and milestone verification.
