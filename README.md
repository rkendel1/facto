# StackLive Code Generator

AI-powered code generation app that produces production-ready StackLive render-only embeds and full applications.

## 🚀 Overview

This is a working tool that outputs real files using a structured, embed-based architecture. The app itself is built entirely from StackLive embeds, demonstrating the power of the render-only pattern.

## 📐 Architecture

### Platform Design

- **Each screen = an embed**: The entire application is composed of modular, reusable embeds
- **Render-only**: No business logic inside embeds
- **Config-driven**: All state comes from configuration and context
- **Shadow DOM**: Each embed is self-contained with isolated styles

### Embeds

1. **generator-form**: Structured input form for describing generation requirements
2. **prompt-preview**: Real-time preview of the compiled LLM prompt
3. **generate-action**: CTA button to trigger code generation
4. **file-output**: Display generated files with copy/download functionality
5. **live-preview**: Optional runtime preview of generated embeds

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm start
```

The app will be available at `http://localhost:8000`

## 📝 Usage

### Basic Workflow

1. **Configure**: Fill out the generator form with your requirements
   - Choose generation mode (single embed, multi-embed app, or library)
   - Specify project name and description
   - Add embed definitions
   - Select options and output types

2. **Preview**: Review the compiled prompt in real-time

3. **Generate**: Click the generate button to create files

4. **Download**: Copy or download individual files, or download all at once

### Generator Form Fields

- **mode**: `single-embed | multi-embed-app | embed-library`
- **name**: Project/component name
- **description**: What you want to generate
- **embeds[]**: Dynamic list of embeds to create
- **design_system**: Toggle to use StackLive design tokens
- **context_aware**: Toggle for context-aware generation
- **output_types**: Select what to generate (embed, app, manifest, variants)

## 🔌 LLM Integration

The app uses OpenAI by default with a vendor-agnostic interface for code generation:

```typescript
interface CodegenProvider {
  generate(prompt: string): Promise<GeneratedFile[]>
}
```

### Setting Up OpenAI

1. **Get an API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) and create an API key

2. **Configure in the App**: 
   - Open the application
   - Find the "OpenAI Settings" panel at the top
   - Enter your API key (starts with `sk-`)
   - Click "Save"

Your API key is stored securely in browser localStorage and never sent anywhere except to OpenAI's API.

### Using a Different AI Provider

Replace the OpenAI provider with your own implementation:

```typescript
import { AppController } from './app.manifest';
import { YourAIProvider } from './your-ai-provider';

const app = new AppController();
app.setProvider(new YourAIProvider());
```

## 📦 Project Structure

```
facto/
├── src/
│   ├── embeds/
│   │   ├── generator-form.ts       # Form for generation config
│   │   ├── prompt-preview.ts       # Prompt display
│   │   ├── generate-action.ts      # Generate button
│   │   ├── file-output.ts          # File viewer/downloader
│   │   └── live-preview.ts         # Runtime preview
│   ├── lib/
│   │   ├── base-embed.ts           # Base class for all embeds
│   │   ├── llm-provider.interface.ts  # AI provider contract
│   │   └── prompt-compiler.ts      # Prompt building logic
│   └── app.manifest.ts             # Application controller
├── index.html                      # Main HTML entry point
├── package.json
├── tsconfig.json
└── build.js                        # Build bundler
```

## 🎨 Design Tokens

The app uses StackLive design tokens for consistent styling:

```css
--sl-color-primary    /* Primary brand color */
--sl-radius           /* Border radius */
--sl-font-family      /* Font stack */
--sl-shadow           /* Box shadow */
```

## 🔒 System Prompt

The following rules are hardcoded into every generation request:

```
You are generating production-ready StackLive render-only code.

RULES:
- Must extend BaseEmbed
- Render-only
- Config-driven
- Shadow DOM only
- Emit embed:render
- Self-contained CSS
- Manifest required
- No frameworks
- TypeScript only

OUTPUT:
Return only code files.
```

## 🧪 Development

### Building

```bash
npm run build
```

Compiles TypeScript and bundles all modules into `dist/app.bundle.js`

### Watch Mode

```bash
npm run dev
```

TypeScript compiler in watch mode for development

### Serving Locally

```bash
npm run serve
```

Starts a local HTTP server on port 8000

## 📋 Requirements

- **No frameworks**: Pure TypeScript and Web Components
- **TypeScript only**: Strongly typed codebase
- **Self-contained CSS**: Each embed includes its own styles
- **Shadow DOM**: Encapsulated components
- **Event-driven**: Communication via custom events

## 🚫 What NOT to Do

- No business logic outside render methods
- No data fetching inside embeds
- No framework dependencies (React, Vue, etc.)
- No external CSS dependencies

## 📄 Output Format

Generated files follow this structure:

```
src/
├── embeds/
│   ├── component-name.ts
│   └── component-name.manifest.ts
├── lib/
│   └── utilities.ts
└── app.manifest.ts
```

## 🤝 Contributing

This is a production-ready tool. Contributions should maintain:
- Render-only pattern
- Config-driven architecture
- Self-contained embeds
- TypeScript typing
- Clean IDE-like design

## 📜 License

MIT