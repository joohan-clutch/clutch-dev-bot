import { OpenAI } from "openai";
import { BugReport } from "../entity/BugReport";
import fs from "fs";
import { FileObject } from "openai/resources/files";
import { VectorStoreFile } from "openai/resources/vector-stores/files";
import { Response } from "openai/resources/responses/responses";
export class OpenAIAdapter {
  private readonly openai: OpenAI;
  private readonly bugReportVectorStoreId: string;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    if (!process.env.BUG_REPORT_VECTOR_STORE_ID) {
      throw new Error("BUG_REPORT_VECTOR_STORE_ID is not set");
    }
    this.bugReportVectorStoreId = process.env.BUG_REPORT_VECTOR_STORE_ID;
  }

  async deleteFilesByFileName(fileName: string) {
    const files = await this.openai.files.list();

    const existingFile = files.data.filter(
      (file) => file.filename === fileName
    );

    for (const file of existingFile) {
      await this.openai.files.del(file.id);
    }
  }

  async uploadBugReportToOpenAI(
    bugReports: BugReport[],
    date: Date
  ): Promise<FileObject> {
    const fileName = `bug_reports_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;

    await this.deleteFilesByFileName(fileName);
    const bugReportsForVectorStore = bugReports.map((bugReport) => {
      return {
        request: bugReport.request,
        details: bugReport.details,
        howToReproduce: bugReport.howToReproduce,
        categories: bugReport.categories,
        jiraIssueKey: bugReport.jiraIssueKey,
        permalink: bugReport.permalink,
        text: bugReport.text,
        replies: bugReport.replies,
      };
    });

    const tempFilePath = `/tmp/${fileName}`;
    fs.writeFileSync(
      tempFilePath,
      JSON.stringify({ bugReports: bugReportsForVectorStore })
    );

    try {
      const response = await this.openai.files.create({
        file: fs.createReadStream(tempFilePath),
        purpose: "assistants",
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to upload bug reports to OpenAI: ${error}`);
    } finally {
      fs.unlinkSync(tempFilePath);
    }
  }
  async createVectorFile(
    fileId: string,
    fileName: string
  ): Promise<VectorStoreFile> {
    await this.deleteVectorFileByFileName(fileName);
    return this.openai.vectorStores.files.create(this.bugReportVectorStoreId, {
      file_id: fileId,
      attributes: {
        filename: fileName,
      },
    });
  }

  async deleteVectorFileByFileName(fileName: string): Promise<void> {
    const response = await this.openai.vectorStores.files.list(
      this.bugReportVectorStoreId
    );
    const vectorFiles = response.data.filter(
      (file) => file.attributes?.filename === fileName
    );
    for (const file of vectorFiles) {
      await this.openai.vectorStores.files.del(
        this.bugReportVectorStoreId,
        file.id
      );
    }
  }

  async searchBugReportFromOpenAI(bugReport: BugReport): Promise<Response> {
    const bugReportAnalysisPrompt = `Your primary goal is to find historical bug reports with similar **symptoms** or **root causes** to the new bug report. Based on the most similar past report(s), you will generate a Jira comment style response that includes how the past issue was resolved and provides guidance on investigating the current new bug.

Consider the following details:

- Use the vector store to search for past bug reports. **Focus your search on identifying reports that describe similar symptoms or investigate similar root causes.**
- Extract and compile the following information from the most relevant previous bug reports:
  - Symptom (as described in the historical report)
  - Root cause (as identified in the historical report)
  - **Resolution** (how the historical issue was solved)
  - Permalinks to the original reports
- Based on the historical resolution, provide **Investigation/Resolution Pointers** for the *current new bug report*. These should be actionable suggestions.
- Address multiple similar reports by listing them concisely.
- If no matching previous bug reports are found, state that clearly.
- If any specific information (e.g., resolution details) cannot be located in the found reports, you may omit that section or state that the information is unavailable.

# Steps

1.  **Analyze the New Bug Report:** Carefully examine the new bug report. Identify its primary **symptoms** (the observable issues) and any stated or implied **details** that might point towards a root cause.
2.  **Targeted Vector Store Search:** Using the identified **symptoms** and **details relevant to the root cause** from the new bug report, search the vector store for historical bug reports that exhibit strong similarities in these areas.
3.  **Evaluate Relevance & Identify Top Matches:** From the search results, prioritize historical reports that most closely match the **symptoms** of the new bug. If multiple reports share similar symptoms, further refine your selection by looking for similarities in discussed **root causes**.
4.  **Extract & Infer Information:** For the identified most relevant historical report(s):
    *   Extract:
        *   Symptom (from the historical report)
        *   Root Cause (from the historical report)
        *   **Resolution** (how the historical issue was solved)
        *   Permalinks (to the historical report)
    *   Infer and Formulate: Based on the historical report's resolution, develop **Investigation/Resolution Pointers** applicable to the *current new bug*. These should be practical suggestions for the user (e.g., "You might want to check...", "Consider looking into...", "A good starting point for investigation could be...").
5.  If no reports match with sufficient accuracy in terms of symptoms or potential root causes, clearly note the lack of similar previous reports.

# Output Format

- Begin with a statement indicating the presence of similar bug reports.
- If similar reports exist, provide a Jira comment style output:

  h3. Similar Bug Reports Found
  h4. Symptom:
    [Description of symptom from past report]
  h4. Root Causes:
    [Description of root cause from past report]
  h4. Resolution (Past Issue):
    [Description of how the similar past issue was solved]
  h4. Investigation Pointers (For Current Issue):
    [Suggestions on where to start investigating or how to resolve the current bug, based on the past issue's resolution. Address the user directly, e.g., "You could start by..."]
  h4. Permalinks:
    [URL to past report]

- If there are multiple similar reports, list and separate each by report number:
  h3. Report 1:
  h4. Symptom: [Description]
  h4. Root Causes: [Description]
  h4. Resolution (Past Issue): [Description]
  h4. Investigation Pointers (For Current Issue): [Suggestions]
  h4. Permalinks: [URL]

  h3. Report 2:
  h4. Symptom: [Description]
  h4. Root Causes: [Description]
  h4. Resolution (Past Issue): [Description]
  h4. Investigation Pointers (For Current Issue): [Suggestions]
  h4. Permalinks: [URL]
- If not similar, state: "There are no matching previous bug reports."

# Examples

**Input:**
- New Bug Report: { details: "Users are reporting that the login button is unresponsive after the latest update. Clicking it does nothing, no errors in console immediately visible." }

**Output with similar reports:**
\`\`\`
h3. Similar Bug Reports Found

h4. Symptom:
  Login button unresponsive after v2.3 deployment.
h4. Root Causes:
  An event listener for the login button was inadvertently removed during a refactor of the UI components.
h4. Resolution (Past Issue):
  The missing event listener was identified and re-added to the login button component. A specific commit reverted the accidental removal.
h4. Investigation Pointers (For Current Issue):
  You should start by examining recent commits to the UI components related to the login page or authentication flow. Specifically, check for any changes that might affect event handling for the login button. It might also be useful to use browser developer tools to inspect the button element and see if the expected event listeners are attached.
h4. Permalinks:
  - https://bugtracker.example.com/report7890
\`\`\`

**Output if no similar report found:**
- "There are no matching previous bug reports."

# Notes

- Accuracy in matching and extracting details is crucial.
- Ensure the **Investigation Pointers** are practical and clearly derived from the historical resolution.
- If historical resolution details are vague, the pointers might be more general.`;

    return this.openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: bugReportAnalysisPrompt,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `This is the new bug report: ${bugReport.text}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "text",
        },
      },
      reasoning: {},
      tools: [
        {
          type: "file_search",
          vector_store_ids: [this.bugReportVectorStoreId],
        },
      ],
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true,
    });
  }
}

export const openaiAdapter = new OpenAIAdapter();
