# LitGitUp Documentation 🚀

## Overview 📚
LitGitUp is a powerful **Software-as-a-Service (SaaS)** platform designed to analyze GitHub repositories, providing **AI-powered insights** and features that enhance development workflows. Using advanced technologies like **LangChain** and **Gemini**, LitGitUp understands the context of your codebase, offering intelligent responses, commit summaries, and more.

## Key Features 🌟

1. **🔍 GitHub Repository Analysis:**
   - 📝 Summarizes each commit in your repository.
   - 🧠 Provides context-aware responses with code references.
   - 📈 Utilizes LangChain and Gemini for vector-based search, enabling intelligent query results.

2. **🎹 Meeting Issue Generation:**
   - 📤 Upload MP3 or MP4 files of your meetings.
   - 📝 Automatically generates issues and action items based on the meeting content using AI-driven transcription and analysis.

3. **🤝 Project Collaboration:**
   - 👥 Invite team members to collaborate on projects.
   - 🔑 Manage member roles and permissions for seamless teamwork.

4. **💳 Credits System:**
   - 🎁 Offers free credits for new users to get started.
   - 💼 Flexible purchasing options to buy more credits based on your requirements.

## Tech Stack 🛠️
- **Frontend:** Next.js, TypeScript, React ⚛️
- **Backend:** tRPC, Prisma, PostgreSQL (Neon) 🔔️
- **AI Integration:** LangChain, Gemini-2.0-Flash Lite, AssemblyAI 🤖

## Deployment 🌐
LitGitUp is **deployed on Vercel** at [https://litgitup.vercel.app](https://litgitup.vercel.app), leveraging Vercel's built-in **Continuous Integration and Continuous Deployment (CI/CD)** pipeline. This ensures that every push to the connected GitHub repository triggers an automatic build and deployment process, resulting in seamless and efficient delivery of updates to the production environment.

## Environment Variables 🔐
To run LitGitUp, you'll need to configure the following environment variables in your `.env` file:

- **Database:**
  - `DATABASE_URL=your_postgresql_database_url`

- **Clerk (Authentication):**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key`
  - `CLERK_SECRET_KEY=your_clerk_secret_key`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/sync-user`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/sync-user`

- **GitHub (API Access):**
  - `GITHUB_TOKEN=your_github_token`

- **Google Gemini (AI Integration):**
  - `NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key`

- **Cloudinary (Media Storage):**
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name`
  - `CLOUDINARY_API_SECRET=your_cloudinary_api_secret`
  - `NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key`
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset`
  - `NEXT_PUBLIC_CLOUDINARY_FOLDER=your_cloudinary_folder`

- **AssemblyAI (Transcriptions):**
  - `NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key`

- **Stripe (Payments):**
  - `STRIPE_SECRET_KEY=your_stripe_secret_key`
  - `STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key`
  - `STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret`

- **App URL:**
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000/`

Ensure all keys are correctly set for the application to function smoothly.

## Installation 🖥️

1. **🗕️ Clone the Repository:**
   ```bash
   git clone https://github.com/03ShreyanshGoel/LitGitUp.git
   cd LitGitUp
   ```

2. **📦 Install Dependencies:**
   ```bash
   npm install
   ```

3. **🔑 Set Up Environment Variables:**
   Create a `.env` file in the root directory and add your environment variables (API keys, database URLs, etc.).

4. **🗓️ Database Setup:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **🚀 Run the Application:**
   ```bash
   npm run dev
   ```

## Usage 💡
- **📊 Commit Analysis:** Connect your GitHub repository and view detailed commit summaries.
- **🔎 Vector Search:** Use the AI-powered search to find relevant code snippets and documentation.
- **🎹 Meeting Transcriptions:** Upload your meeting recordings and generate actionable issues directly in your repository.
- **👥 Project Collaboration:** Invite members to your projects and manage their contributions effectively.

## Contribution ✨
Feel free to fork the repository and contribute by submitting pull requests. Ensure you follow the project's coding standards and guidelines.

## License 📜
This project is licensed under the **MIT License**.

For more details, visit the [GitHub Repository](https://github.com/03ShreyanshGoel/LitGitUp).

