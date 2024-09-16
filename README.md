# AI Content Machine - Next.js 14 Project (RAG-Based Solution)

## Project Overview

This project is a prototype of an AI-driven Content Machine that automates content creation based on a dataset of social media posts and scripts. It uses **Retrieval-Augmented Generation (RAG)** for querying and generating content.

The system consists of two components:

1. **Backend (Langflow + RAG)**: Manages data ingestion and retrieval using Retrieval-Augmented Generation.
2. **Frontend (Next.js 14)**: Provides a user-friendly interface for user interaction, allowing users to input queries and receive AI-generated content.

## Features

- **AI Content Generation**: Automates content creation by querying social media posts and scripts using RAG.
- **RAG-Based Querying**: Leverages Retrieval-Augmented Generation for relevant data retrieval and content generation.
- **Langflow Integration**: Ingests data and integrates RAG for querying and content creation.
- **User-Friendly Interface**: A Next.js front-end that enables users to input prompts and view generated content.

## Setup and Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-repo-name/ai-content-machine-rag.git
cd ai-content-machine-rag
```

### 2. **Install Dependencies**

Ensure you have Node.js installed, then run:

```bash
npm install
```

### 3. **Set Up Environment Variables**

Create a `.env` file in the root directory and populate it with the following environment variables:

```bash
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
AUTH_SECRET=YOUR_AUTH_SECRET
KV_URL=YOUR_KV_URL
KV_REST_API_URL=YOUR_KV_REST_API_URL
KV_REST_API_TOKEN=YOUR_KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN=YOUR_KV_REST_API_READ_ONLY_TOKEN
NEXT_PUBLIC_LANGFLOW_API_KEY=YOUR_LANGFLOW_API_KEY
NEXT_PUBLIC_LANGFLOW_BACKEND=YOUR_LANGFLOW_BACKEND_URL
NEXT_PUBLIC_LANGFLOW_ID=YOUR_LANGFLOW_INSTANCE_ID
```

For more information on generating these keys:

- OpenAI API Key: [OpenAI API Keys](https://platform.openai.com/account/api-keys)
- Vercel KV Setup: [Vercel KV Quickstart](https://vercel.com/docs/storage/vercel-kv/quickstart)

### 4. **Run the Development Server**

Start your Next.js development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your application.

---

## Project Breakdown

### **Phase 1: Environment Setup (Langflow with RAG)**

- Install and configure Langflow.
- Integrate the Retrieval-Augmented Generation (RAG) solution.
- Ensure proper setup and connectivity with Langflow and your AI model.

### **Phase 2: Data Integration**

- Ingest the provided dataset of social media posts and scripts into Langflow.
- Preprocess the data to ensure it's properly indexed and ready for RAG-based retrieval.

### **Phase 3: RAG-Based Querying**

- Implement **Retrieval-Augmented Generation (RAG)** to query the dataset and generate content.
- Ensure accurate retrieval of relevant social media posts and scripts based on user queries.
- Test the RAG model for content accuracy and relevance.

### **Phase 4: Front-End Interface**

- Develop a simple interface using **Next.js 14** for user input.
- Integrate the front-end with Langflow to pass user queries and display generated content.
- Test the front-end for smooth interaction with the RAG-based back-end.

---

## Technologies Used

- **Next.js 14**: Front-end framework for building the user interface.
- **Langflow**: Manages the backend for data processing and retrieval.
- **RAG (Retrieval-Augmented Generation)**: AI-powered solution for content generation.
- **OpenAI API**: Utilizes OpenAI models for language generation.
- **Vercel KV**: Provides key-value storage for handling data.

---

## Folder Structure

```
|-- public/                   # Static files
|-- components/               # React components
|-- app/                      # Next.js pages (UI routes)
|-- utils/                    # Utility functions (e.g., API integrations)
|-- lib/                      # lib functions (e.g., API integrations)
|-- .env.example              # Environment variable template
|-- README.md                 # Project README file
|-- package.json              # Node.js project configuration
```

---

## Testing

To run tests, execute:

```bash
npm run test
```

---

## Deployment

To deploy the application on Vercel, push your code to a GitHub repository and link the repo in your Vercel dashboard. Vercel will automatically build and deploy your Next.js application.

### Environment Variables for Deployment:

Make sure to add the environment variables from your `.env` file to your Vercel dashboard under **Settings > Environment Variables**.

---

## Contributing

If you'd like to contribute, feel free to submit a pull request or open an issue.

---

## License

This project is licensed under the MIT License.

---

Let me know if you need any more adjustments or additional sections!
