# AuroraREADME 🪄

AuroraREADME is a powerful application that helps you create stunning and professional README files for your GitHub repositories in minutes. It leverages intelligent editing tools to assist in generating sections, creating logos, adding badges, and improving your overall documentation quality.

## ✨ Features

- **📝 Section Generation**: Automatically generate standard README sections like `Introduction`, `Features`, `Tech Stack`, `Installation`, and more.
- **🎨 Logo Creation**: Instantly create a simple, modern, and abstract logo for your project.
- **🛡️ Badge Insertion**: Easily add a variety of pre-configured Shields.io badges for licenses, stars, forks, and more.
- **✍️ Content Improvement**: Revise and enhance your existing README content, correcting grammar, improving clarity, and ensuring a professional tone.
- **🎨 Multiple Writing Styles**: Choose between `professional`, `friendly`, and `concise` writing styles for generated content.
- **✏️ Live Preview & Edit**: A side-by-side view allows you to see a live Markdown preview as you edit the raw text.
- **💾 Local State Persistence**: Your work is automatically saved to your browser's local storage, so you'll never lose your progress.
- **☀️/🌑 Dark & Light Mode**: A sleek and comfortable interface that adapts to your system's theme.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and npm installed on your machine.

### Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/joker10451/aurora-readme-generator.git
   cd aurora-readme-generator

   ```

2. **Install NPM packages:**
   ```sh
   npm install
   ```

3. **Set up your environment variables:**
   Create a file named `.env.local` in the root of your project and add your Gemini API key:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```
   You can obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4. **Run the development server:**
   ```sh
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **AI/Generative**: [Google's Gemini model via Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/issues).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
