#!/bin/bash
# SuperClaude Environment Activation Script for Degentalk
# This script activates the SuperClaude virtual environment and sets up the path

echo "🚀 Activating SuperClaude environment for Degentalk..."

# Add uv to PATH
export PATH="$HOME/.local/bin:$PATH"

# Activate the virtual environment
source .venv/bin/activate

echo "✅ SuperClaude environment activated!"
echo "🔧 Available SuperClaude commands:"
echo "   - /sc:implement   - Feature implementation"
echo "   - /sc:analyze     - Code analysis" 
echo "   - /sc:build       - Build and compilation"
echo "   - /sc:design      - Architecture and design"
echo "   - /sc:troubleshoot - Debugging and issues"
echo "   - /sc:test        - Testing and validation"
echo "   - /sc:task        - Advanced task management"
echo "   - /sc:document    - Documentation generation"
echo "   - /sc:improve     - Code improvement"
echo "   - /sc:cleanup     - Code cleanup and refactoring"
echo "   - /sc:git         - Git operations"
echo "   - /sc:estimate    - Time and effort estimation"
echo "   - /sc:explain     - Code explanation"
echo "   - /sc:index       - Code indexing"
echo "   - /sc:load        - Load and examine files"
echo "   - /sc:spawn       - Create new components"
echo "   - /sc:workflow    - Development workflows"
echo ""
echo "📚 Framework files located at: ~/.claude/"
echo "🔌 MCP servers configured for: sequential-thinking, context7, magic, playwright"
echo ""
echo "💡 To use commands in Claude Code, simply type them (e.g., '/sc:implement user authentication')"