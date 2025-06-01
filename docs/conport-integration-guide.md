# Context Portal (ConPort) Integration Guide for Degentalk

## 1. Introduction
This guide details how the Context Portal (ConPort) MCP server is integrated into the Degentalk project. ConPort serves as the **primary, authoritative source of project memory**, enhancing collaboration, context retention, and the effectiveness of AI-assisted development.

All AI agents (including Cline) and developers should prioritize ConPort for storing, retrieving, and managing project context.

## 2. Role of ConPort in Degentalk
- **Centralized Knowledge Base:** Replaces fragmented, file-based memory systems with a structured, queryable database.
- **AI Agent Empowerment:** Provides AI agents with consistent, up-to-date project information, enabling more accurate and context-aware assistance.
- **Improved Developer Onboarding:** New team members can quickly get up to speed by querying ConPort for project history, decisions, and architecture.
- **Dynamic Context Management:** Supports evolving project needs through flexible custom data logging and relationship tracking.

## 3. Initialization and Bootstrapping
ConPort is initialized at the start of every AI agent session. The process is governed by `.clinerules/conport-usage-protocol.mdc`.

### 3.1. Workspace ID
- ConPort operations are workspace-specific. The `workspace_id` for Degentalk is the absolute path to the project root (`/Users/gnarcotic/Degentalk`).

### 3.2. First-Time Setup in a Workspace
- If ConPort's database (`<workspace_root>/context_portal/context.db`) doesn't exist, it will be created on the first ConPort tool use.
- **Using `projectBrief.md`**:
    - A `projectBrief.md` file in the workspace root (`/Users/gnarcotic/Degentalk/projectBrief.md`) is used to bootstrap ConPort's **Product Context**.
    - During the initial setup, AI agents will prompt to import content from this file into ConPort. This provides an immediate baseline understanding of the project.

## 4. Key ConPort Tools & Usage
Refer to `.clinerules/conport-usage-protocol.mdc` and the `cline_conport_strategy` (from ConPort's `conport-custom-instructions`) for a comprehensive list of tools and their detailed usage patterns. Below is a summary of frequently used interactions:

- **Loading Context**:
    - `get_product_context`: For overall project goals, features.
    - `get_active_context`: For current task focus, open issues.
    - `get_decisions`, `get_progress`, `get_system_patterns`: For specific historical data.
    - `get_custom_data`: For glossary, critical settings, etc.
    - `get_recent_activity_summary`: To catch up on recent changes.
- **Updating Context**:
    - `update_product_context`, `update_active_context`: For significant changes to these core contexts (use `patch_content` for partial updates).
    - `log_decision`: To record new architectural or key implementation decisions.
    - `log_progress`: To track task status.
    - `log_system_pattern`: To document new or modified coding/architectural patterns.
    - `log_custom_data`: For all other structured information (e.g., new "Learnings", "ErrorLogs", "ProjectGlossary" terms, "ProjectStructure" updates).
- **Linking Information**:
    - `link_conport_items`: To create relationships between different pieces of context (e.g., a decision implemented by a system pattern).
- **Searching**:
    - `search_decisions_fts`, `search_custom_data_value_fts`, `search_project_glossary_fts`: For keyword-based searches.
    - `semantic_search_conport`: For conceptual queries.

## 5. Interaction with `.clinerules` and `.cursor/rules`
- **`.clinerules/conport-usage-protocol.mdc`**: This is the **master rule** for AI agents regarding ConPort. It dictates initialization, tool usage, and general interaction patterns.
- **`.clinerules/memory-bank.md`**: This rule now directs AI agents to use ConPort as the primary memory system, with `docs/memory-bank/` files serving as initial seed material or archives.
- **`.clinerules/cline-continuous-improvement-protocol.md`**: This rule now emphasizes logging learnings, difficulties, and successes into ConPort using its structured tools. `docs/memory-bank/raw_reflection_log.md` can be a temporary scratchpad.
- **`.cursor/rules/`**: These rules provide specific guidance for coding tasks. ConPort can store and retrieve information related to these rules, such as decisions made based on a rule, or patterns that exemplify a rule.

## 6. Managing `directory-tree.md` with ConPort
- The `directory-tree.md` file provides a snapshot of the project's file structure.
- To keep ConPort informed of the project structure:
    1.  When `directory-tree.md` is updated (e.g., after significant refactoring), its content **SHOULD** be logged into ConPort.
    2.  Use the `log_custom_data` tool:
        *   `workspace_id`: The Degentalk project root path.
        *   `category`: "ProjectStructure"
        *   `key`: "directoryTree"
        *   `value`: The full string content of `directory-tree.md`.
- This allows AI agents to query ConPort for the project structure if direct file access is unavailable or less efficient.

## 7. Best Practices for Developers & AI Agents
- **Be Proactive:** Continuously log new decisions, progress, learnings, and context changes into ConPort. Don't wait until the end of a session.
- **Be Specific:** Use appropriate ConPort tools for different types of information (e.g., `log_decision` for decisions, not just generic `log_custom_data`).
- **Link Items:** Whenever relationships between pieces of information are identified, use `link_conport_items` to build the project's knowledge graph.
- **Confirm Updates:** AI agents should confirm with the user before making significant updates to ConPort.
- **Use `workspace_id`:** Always provide the correct `workspace_id` with every ConPort tool call.
- **"ConPort Sync"**: Developers can request a "ConPort Sync" from AI agents to ensure the session's discussions are fully captured in ConPort.

By consistently using ConPort, the Degentalk project will benefit from a robust, dynamic, and easily accessible memory, improving development efficiency and AI collaboration.
