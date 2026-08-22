# Senior Frontend Developer Take-Home Assignment — Execution Roadmap

**Candidate Submission Target**: Before Aug 22, 2026 4:00 PM  
**Tech Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · Socket.io Client · Framer Motion  
**Live API Host**: `https://frontend-task-chatapp.onrender.com`

---

## 📌 Three-Part Overview

| Part | Section | Deliverable | Location |
| :--- | :--- | :--- | :--- |
| **Part 1** | **API Documentation** | Complete, clean REST & WebSocket specification | `docs/API_DOCUMENTATION.md` & `/docs` route |
| **Part 1** | **Feature Implementation** | Full-featured, real-time 1-to-1 & group chat application | `/chat` & `/login` routes |
| **Part 2** | **Creative Landing Page** | High-aesthetic, responsive product showcase page | `/` (Home route) |
| **Part 3** | **Thought Process Write-up** | Architectural reasoning, API audit, trade-offs, AI usage | `docs/THOUGHT_PROCESS.md` & `README.md` |

---

## 🛠️ Step-by-Step Task Breakdown

### Step 1: Formal API Documentation (`Part 1.1`)
- [ ] Document all REST endpoints: Auth, User Search, Conversations, Group Management, Messages, Health Check.
- [ ] Document the live response structures, HTTP status codes, error payloads, and authentication scheme.
- [ ] Document the Socket.io WebSocket protocol (`message:send`, `message:new`, `conversation:updated`, auth handshake).
- [ ] Create an in-app interactive API viewer at `/docs`.

### Step 2: Architecture, Types & Utility Foundation
- [ ] Install essential production dependencies: `socket.io-client`, `lucide-react`, `clsx`, `tailwind-merge`, `framer-motion`, `date-fns`, `canvas-confetti`.
- [ ] Build strict TypeScript models for Users, Messages, Conversations, Group details, and API responses.
- [ ] Implement an API client with bearer token management and centralized error handling.
- [ ] Implement a resilient Socket.io connection manager with auto-reconnect and state events.
- [ ] Implement a sound effect manager for message cues.

### Step 3: Authentication & Session Management
- [ ] Create a Login page with phone and name inputs.
- [ ] Handle auto-registration / auto-login seamless flow.
- [ ] Persist authentication token in `localStorage` + session cache.
- [ ] Implement automatic session validation and profile restoration via `/auth/me`.

### Step 4: Conversation Hub & Group Management
- [ ] Build a responsive sidebar with direct and group conversations list, unread badges, last message snippets, and timestamps.
- [ ] Build a User Search modal with debounced query search (`/users/search?q=...`) and direct chat creation.
- [ ] Build a Group Creation modal supporting group name and multi-user selection (min 2 participants).
- [ ] Build a Group Details drawer with admin features: rename group, add members, remove members, promote to admin, and leave group.

### Step 5: Core Chat Panel & Message List (Maximum Polish)
- [ ] Visual distinction between sender (current user) and receiver bubbles.
- [ ] Multi-participant group color coding with distinct sender badges and avatars.
- [ ] Smart scroll hook: auto-scroll to bottom on new messages, lock scroll when browsing history, floating "New messages below" indicator.
- [ ] Pagination for older messages via cursor with scroll-position retention.
- [ ] Message input with character limit, empty message prevention, Enter to send, Shift+Enter for newline.
- [ ] Optimistic updates: messages display immediately with a sending indicator before server confirmation.
- [ ] Real-time Socket.io updates for incoming messages and conversation state changes.
- [ ] Complete loading skeletons, error states, and empty states.

### Step 6: Senior Polish & Bonus Features
- [ ] **Command Palette (`Cmd/Ctrl + K`)**: Instant search and switch between chats.
- [ ] **Rich Message Formatting**: Support for inline code, bold, italic, and links.
- [ ] **Interactive Emoji Picker**: Quick emoji additions and reactions.
- [ ] **Network Connection Banner**: Real-time indicator for connected, reconnecting, or offline status.

### Step 7: Creative Showcase Landing Page (`Part 2`)
- [ ] Hero section with compelling copy, live platform metrics, and dual CTA buttons.
- [ ] Live interactive chat simulator widget directly on the landing page.
- [ ] Feature Bento grid detailing real-time WebSocket protocol, group management, and smart scroll design.
- [ ] Architecture section detailing the modern Next.js 16 + React 19 + Socket.io stack.

### Step 8: Thought Process Write-up & API Audit (`Part 3`)
- [ ] Why architecture/libraries were chosen and trade-offs considered.
- [ ] Landing page design rationale.
- [ ] In-depth API discrepancies audit (e.g., `/health` vs `/api/health`, validation constraints).
- [ ] Honest AI tool usage breakdown.
- [ ] What would be improved with more time.
- [ ] Update `README.md` with complete local run instructions and submission deliverables.

### Step 9: Verification, Linting & Production Build
- [ ] Run full typecheck (`tsc --noEmit`) and linting (`npm run lint`).
- [ ] Test production build (`npm run build`).
- [ ] Verify responsiveness and edge cases across screen sizes.
