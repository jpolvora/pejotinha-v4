---
created: 2026-03-28T19:21:32Z
title: Standardize Security Scan and Update Documentation
area: tooling
files:
  - README.md
  - AGENTS.md
  - .agent/agents/orchestrator.md
  - .agent/skills/vulnerability-scanner/scripts/security_scan.py
---

## Problem

The security script location is incorrectly referenced in `orchestrator.md` (`.agent/scripts/security_scan.py` vs `.agent/skills/vulnerability-scanner/scripts/security_scan.py`), causing security scans to fail. Additionally, the project's root documentation (README and AGENTS.md) needs updating to accurately reflect the current system architecture and available agent skills.

## Solution

Fix script path references in the orchestrator agent definition, update README.md to describe the finalized v4 architecture, and sync AGENTS.md with relevant existing skills (e.g., `vulnerability-scanner`, `vibecoder-logger`, `nextjs-react-expert`). Verify everything with a successful local commit after running the security check.
