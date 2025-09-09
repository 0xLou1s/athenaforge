# 🏛️ AthenaForge

> **The World's First Decentralized Hackathon Platform**

AthenaForge is an open-source, decentralized hackathon platform built entirely on IPFS. Designed by developers, for developers — creating a global community of innovators with permanent project records and transparent judging processes.

## 🌟 Vision

AthenaForge was created with the mission to build the world's first decentralized, open-source hackathon platform where everything is stored on IPFS.

We unite top Web3 builders to co-create a platform that developers actually want to use. This is about building something real and lasting — a core piece of infrastructure that will power hundreds of hackathons and serve millions of developers globally.

## 🎯 Objectives

- 🏗️ **Decentralized Hackathon Platform** - Create a fully decentralized hackathon infrastructure
- 🔒 **Permanent Storage** - All data stored on IPFS to ensure sustainability
- 🌐 **Open Source** - Platform is completely open and extensible by the community
- 👥 **Builder Community** - Connect Web3 developers worldwide
- 🏆 **Transparent Judging** - Fair and transparent evaluation process
- 📈 **Builder Profiles** - Create permanent profiles for developers and projects

## 🚀 Key Features

### 🔍 Hackathon Discovery
- Centralized hackathon discovery page with robust search, filter, and sort features
- Support for IPFS-based metadata to enable decentralized event indexing
- Display active, upcoming, and past hackathons

### 📋 Event Details
- Hackathon detail page with sections:
  - Overview
  - Prizes & Judges
  - Schedule
  - Submitted Projects
- Clear display of event tracks, judging criteria, and registration actions
- Store all event details on IPFS for permanence

### 🎨 Organizer Workflow
- Multi-step "Create Hackathon" flow collecting key data
- Allow organizers to publish events with IPFS-stored metadata
- Track community interactions

### 👥 Project Submission Journey
- Seamless "Create & Submit Project" flow for developers:
  - Registration
  - Team formation
  - Project page creation
  - Code/demo upload
  - Submission to specific hackathon
- Host all submissions on IPFS for fully persistent dev records

### 🏆 Judging & Evaluation
- Dedicated Judge Dashboard with authorized access
- Display all submitted projects, filterable by track
- Scoring form for judges with private feedback
- Enforce judging period and lock score submission after deadline
- Store final scores and comments on IPFS with timestamps and wallet signatures

### 👤 User & Admin Management
- User Dashboard for managing profiles, credentials, and submissions
- Admin Panel for moderating events and reviewing entries
- Persistent builder reputation systems and credential verification via IPFS

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Web3 & Authentication
- **Privy** - Web3 authentication
- **Wagmi 2.16.9** - React hooks for Ethereum
- **Viem 2.37.4** - TypeScript interface for Ethereum

### State Management & Data
- **TanStack Query 5.87.1** - Server state management
- **Zod 4.1.5** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast bundler for development

## 📦 Installation

### System Requirements
- Node.js 18+
- pnpm (recommended) or npm
- Git

### Project Setup

1. **Clone repository**
```bash
git clone https://github.com/0xLou1s/athenaforge.git
cd athenaforge
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Update necessary environment variables:
```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# IPFS Configuration
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_IPFS_API_URL=your_ipfs_api_url

```

4. **Run development server**
```bash
pnpm dev
# or
npm run dev
```

5. **Open browser**
Visit [http://localhost:3000](http://localhost:3000)


## 🔄 Workflow

### 1. Hackathon Discovery
Users can search and filter active, upcoming, or past hackathons through the centralized discovery page.

### 2. Registration & Participation
- Connect wallet through Privy
- Register for hackathon
- Create or join teams

### 3. Project Development
- Create project page with detailed information
- Upload code repository
- Add demo videos and documentation
- Store everything on IPFS

### 4. Project Submission
- Submit project to specific hackathon
- Metadata stored permanently on IPFS
- Automatically create builder profile

### 5. Judging & Evaluation
- Judges review projects through dedicated dashboard
- Score based on predefined criteria
- Feedback stored on IPFS with signatures

## 🤝 Contributing

We welcome all contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

### Contribution Process
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🔗 Links

- **Website**: [https://athenaforge.vercel.app](https://athenaforge.vercel.app)
- **GitHub**: [https://github.com/0xLou1s/athenaforge](https://github.com/0xLou1s/athenaforge)
- **Twitter**: [@0xLou1s](https://x.com/0xLou1s)
- **Telegram**: [@not0xLou1s](https://t.me/not0xLou1s)

## 🙏 Acknowledgments

- **AthenaX** - Web3 builder community
- **IPFS** - Decentralized storage infrastructure
- **Web3 Community** - Developer community and contributors

---

**Built with ❤️ by the Web3 builders community**

*AthenaForge - Where the future of hackathons is forged*