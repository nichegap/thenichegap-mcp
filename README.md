# TheNicheGap MCP Server

An official [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for TheNicheGap. 

This server allows AI assistants (like Claude Desktop) to connect directly to TheNicheGap's real-time SEO analysis engine. Instead of relying on LLM hallucinations, your AI assistant can fetch real Google top-10 SERP data, analyze content gaps, and write highly differentiated SEO articles.

## Features

* **Real SERP Data**: Fetches actual top-10 rankings for any given keyword.
* **Content Gap Analysis**: Identifies what the top-10 unanimously cover (Must-Haves) and what they miss (Gaps).
* **Automated Outline**: Returns an SEO-optimized H1/H2/H3 structure with CTR-optimized title suggestions.

## Prerequisites

To use this MCP server, you need a **TheNicheGap API Key**. 
1. Log in to your [TheNicheGap Dashboard](https://thenichegap.com/op/developer).
2. Generate an API Key in the Developer section.

## Installation

### For Claude Desktop

1. Open your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the TheNicheGap MCP Server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "thenichegap": {
      "command": "npx",
      "args": [
        "-y",
        "@thenichegap/mcp-server"
      ],
      "env": {
        "THENICHEGAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop. You will now see a tool icon (hammer) in the Claude interface indicating that TheNicheGap tools are available.

## Usage Examples

Once installed, you can simply ask Claude to use TheNicheGap:

* *"Analyze the keyword 'best standing desk' using TheNicheGap. What are the content gaps?"*
* *"Call TheNicheGap for 'how to lose weight'. Based on the Must-Haves and Gaps it returns, write a complete 2000-word blog post for me."*

## Local Development (For Contributors)

1. Clone this repository.
2. Run `npm install`
3. Build the server: `npm run build`
4. Test locally using the MCP Inspector:
   ```bash
   THENICHEGAP_API_KEY=your_key_here npx @modelcontextprotocol/inspector node build/index.js
   ```

## License

MIT
