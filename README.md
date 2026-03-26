# Kinetic Golf

Kinetic Golf is a premium subscription platform built for the golf community, combining high-stakes monthly draws with global charity impact.

## Core Features
- **The Kinetic Index**: Advanced golf performance tracking using Stableford scoring.
- **Monthly Draws**: High-stakes prize draws with weighted probability based on performance.
- **Charity Integration**: $1 from every member's monthly subscription goes directly to their chosen charity partner.
- **Wallet System**: Secure withdrawal of tournament winnings via Bank/UPI.
- **Admin Hub**: Full platform control, including automated draws, winner verification, and financial reporting.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Framer Motion, Tailwind CSS, Three.js
- **Backend**: Node.js, Express, Nodemailer, Razorpay
- **Database**: Supabase
- **Visuals**: React-Three-Fiber for advanced 3D orbital ornaments.

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Arun-r485/Kinetic-Golf.git
   cd Kinetic-Golf
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure the following:
   - Supabase URL & Key
   - Razorpay API Credentials
   - Brevo (SMTP) Credentials for transactional emails
   - JWT Secret

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---
*Built with passion for the game of golf and social impact.*
