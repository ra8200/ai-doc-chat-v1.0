# AI Doc Chat!

[ReadMe](https://github.com/user-attachments/assets/b701939b-c663-41be-ac88-ed6ef085823a)


**AI Doc Chat** is an interactive document companion that allows users to upload PDF files and interact with them through a chatbot interface. The application leverages Firebase, Pinecone, and LangChain to provide fast, accurate, and context-aware responses based on the content of the uploaded documents.

## Features

- **Store Your PDFs:** Securely store your important PDF files and access them anytime, anywhere.
- **Blazing Fast Responses:** Experience lightning-fast answers to your queries.
- **Chat Memorization:** The chatbot remembers previous interactions, providing a seamless and personalized experience.
- **Interactive PDF Viewer:** Engage with your PDFs using an intuitive, interactive viewer.
- **Cloud Backup:** Your PDFs are safely backed up on the cloud.
- **Responsive Across Devices:** Access and chat with your PDFs on any device.

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- Firebase account with Firestore and Firebase Storage enabled
- Pinecone API key for vector search capabilities
- OpenAI API key for language model interactions

### Installation

1. Clone the repository:
        ```bash
    git clone https://github.com/ra8200/ai-doc-chat-v1.0.git
    cd ai-doc-chat-v1.0

2. Install the dependencies:
    ```bash
    npm install

3. Set up environment variables:

    - Create a .env.local file in the root of your project.

    - Add the following environment variables:

        FIREBASE_SERVICE_KEY='YOUR_FIREBASE_SERVICE_KEY_JSON_CONTENT'
        PINECONE_API_KEY='YOUR_PINECONE_API_KEY'
        OPENAI_API_KEY='YOUR_OPENAI_API_KEY'
        NEXT_PUBLIC_CLERK_FRONTEND_API='YOUR_CLERK_FRONTEND_API_KEY'

4. Run the development server:
    ```bash
    npm run dev

## Deployment

- This project is configured to deploy seamlessly on Vercel. Ensure that all necessary environment variables are set up in the Vercel dashboard.

- Building for Production

- To create a production build, run:

- npm run build

- Running in Production Mode

- To run the application in production mode:

- npm run start

## Project Structure

- /app: Contains the Next.js pages, including the main dashboard and upload pages.
- /components: Reusable UI components like buttons, inputs, chat interface, etc.
- /firebase: Firebase configuration and initialization files.
- /lib: Contains utility functions and configurations for external services like Pinecone and LangChain.
- /styles: Global CSS files.
- /public: Static files like images.

## Technologies Used

- Next.js: React framework for server-side rendering and static site generation.
- Firebase: Backend as a service for authentication, Firestore, and storage.
- Pinecone: Vector search engine for handling document embeddings.
- LangChain: Framework for building language model applications.
- Clerk: Authentication and user management service.
- Tailwind CSS: Utility-first CSS framework for styling.

## Contributing

**Contributions are welcome! Please follow the standard GitHub flow:**

1. Fork the repository.
2. Create a feature branch (git checkout -b feature-name).
3. Commit your changes (git commit -m 'Add new feature').
4. Push to the branch (git push origin feature-name).
5. Open a pull request.

## License

This project is licensed under the MIT License.

Contact

For any inquiries or support, feel free to reach out via GitHub issues.
