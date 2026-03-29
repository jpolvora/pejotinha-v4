# INTEGRATIONS.md - Pejotinha Core Integrations

## Backend Services
- **Supabase**: Primary backend including PostgreSQL, Authentication, and Storage.
- **Prisma 7**: ORM layer with adapter-based architecture (using `@prisma/adapter-pg`). Configuration is centralized in `prisma.config.ts`.

## External APIs
- **AI Ecosystem**:
  - **OpenAI**: AI-powered features via `@ai-sdk/openai`.
  - **Anthropic**: AI-powered features via `@ai-sdk/anthropic`.
  - **Google Gemini**: AI-powered features via `@ai-sdk/google`.
- **Vercel AI SDK**: Unified interface for AI model integration.

## Utility Libraries
- **jspdf**: Client-side PDF generation for reports.
- **Lucide React**: Icon library for a consistent design system.
- **Shadcn UI**: Modern UI components.
- **Sonner**: Premium toast notifications.
