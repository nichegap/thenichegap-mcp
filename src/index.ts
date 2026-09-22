#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// 1. Validate API Key
const API_KEY = process.env.THENICHEGAP_API_KEY;
if (!API_KEY) {
  console.error("Error: THENICHEGAP_API_KEY environment variable is required.");
  process.exit(1);
}

// 2. Initialize MCP Server
const server = new McpServer({
  name: "thenichegap-mcp",
  version: "1.0.0",
});

// 3. Register Tool: analyze_niche_gap
server.tool(
  "analyze_niche_gap",
  "Analyze an SEO keyword to find search intent, industry must-haves, and content gaps using real SERP data from TheNicheGap. Use this to help craft highly differentiated articles.",
  {
    keyword: z.string().describe("The target SEO keyword to analyze (e.g., 'best standing desk')."),
    locale: z.string().optional().describe("The language locale code for the analysis (e.g., 'en', 'zh'). Defaults to 'en'."),
  },
  async ({ keyword, locale }) => {
    try {
      const response = await axios.post(
        "https://thenichegap.com/api/analyze",
        {
          keyword,
          locale: locale || "en",
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data.success || !data.report) {
        return {
          content: [
            {
              type: "text",
              text: `Analysis failed. API returned: ${JSON.stringify(data)}`,
            },
          ],
          isError: true,
        };
      }

      // Format the report for Claude
      const mustHaves = (data.report.mustHaves || []).map((m: any) => 
        `- **${m.topic}** (${m.coveragePercent || m.coverage || 0}% / ${m.coverageCount || 0} mentions)`
      ).join("\n");

      const gapsList = data.report.contentGaps || data.report.gaps || [];
      const gaps = gapsList.map((g: any) => 
        `- **${g.topic}** (Coverage: ${g.coverageCount || 0}/10): ${g.opportunity}`
      ).join("\n");

      let outlineText = "";
      if (Array.isArray(data.report.outline)) {
        outlineText = data.report.outline.map((o: any) => `${"#".repeat(o.level || 2)} ${o.heading} \n*Context: ${o.context || ""}*`).join("\n");
      } else if (data.report.outline?.sections) {
        outlineText = `# ${data.report.outline.h1 || keyword}\n` +
          data.report.outline.sections.map((s: any) => `## ${s.h2}\n${(s.h3s || []).map((h: string) => `- ${h}`).join("\n")}`).join("\n\n");
      }

      const reportText = `
# TheNicheGap Analysis Report
**Keyword**: ${keyword}
**Search Intent**: ${data.report.intent?.type || "Unknown"} - ${data.report.intent?.reasoning || ""}

## Must-Haves (Covered by Top 10)
${mustHaves}

## Content Gaps (Missed by Top 10)
${gaps}

## Recommended Outline
${outlineText}
      `;

      return {
        content: [
          {
            type: "text",
            text: reportText.trim(),
          },
        ],
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Failed to analyze keyword '${keyword}': ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 4. Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TheNicheGap MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
