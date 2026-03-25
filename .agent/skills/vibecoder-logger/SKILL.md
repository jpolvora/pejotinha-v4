---
name: vibecoder-logger
description: Organized development history - saves implementation plans and walkthroughs for future reference.
trigger: always
version: 1.0
priority: HIGH
---

# VibeCoderLogger - Development History Organizer

This skill ensures that every development cycle (Planning → Execution → Verification) is documented and preserved for future reference. This is a core part of the "vibe coding" philosophy: maintaining a clear trail of thought and action.

---

## 🚀 Execution Pattern

Whenever a new implementation plan or walkthrough is generated, they MUST be saved to the project's `/plans` directory.

| Artifact Type | Destination | Timing |
|--------------|-------------|---------|
| **Implementation Plan** | `/plans/{date}_{task_slug}_plan.md` | At the start of EXECUTION |
| **Walkthrough** | `/plans/walkthroughs/{date}_{task_slug}_walkthrough.md` | After VERIFICATION |

---

## 📁 Directory Structure

The system will maintain the following structure:
- `/plans/` - Root for all implementation plans.
- `/plans/walkthroughs/` - Summaries of what was actually performed.

---

## 📝 Rules

1. **Naming Convention**: Use `YYYY-MM-DD_{task_name_slug}_plan.md` for plans and `YYYY-MM-DD_{task_name_slug}_walkthrough.md` for walkthroughs.
2. **Persistence**: These files are part of the repository and should be committed.
3. **Reference**: Before starting a new feature, check `/plans` for relevant previous work.
4. **Cleanliness**: Keep plans and walkthroughs concise but comprehensive.

---

## 🔴 Mandatory Step

At the end of every task, ensure the walkthrough is generated and saved. If a plan was created, ensure it is also saved if not already present.
