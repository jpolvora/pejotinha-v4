# Fix VibeCoderLogger Integration

The `vibecoder-logger` skill is currently not executing because it is not listed in the `skills` field of the specialist agents' YAML frontmatter. This plan outlines the steps to add the skill to all relevant agents and ensure future consistency.

## Proposed Changes

### [Component Name] Agent Configurations

#### [MODIFY] [orchestrator.md](file:///c:/Users/galaxy/source/pejotinha-v4/.agent/agents/orchestrator.md)
Add `vibecoder-logger` to the `skills` list in the frontmatter.

#### [MODIFY] [project-planner.md](file:///c:/Users/galaxy/source/pejotinha-v4/.agent/agents/project-planner.md)
Add `vibecoder-logger` to the `skills` list in the frontmatter.

#### [MODIFY] Other Agents in [.agent/agents/](file:///c:/Users/galaxy/source/pejotinha-v4/.agent/agents/)
Add `vibecoder-logger` to `skills` for all relevant agents (frontend, backend, db, mobile, debugger, test, devops, security).

#### [MODIFY] [AGENTS.md](file:///c:/Users/galaxy/source/pejotinha-v4/AGENTS.md)
Add YAML frontmatter to explicitly list core skills, ensuring the system recognizes them at the project level.

## Verification Plan

### Manual Verification
1.  Verify that `vibecoder-logger` appears in the `skills` list of the modified agent files.
2.  Save this very plan to `/plans/2026-03-25_fix_vibelogger_plan.md` to demonstrate the skill's enforcement.
3.  After implementation, create a walkthrough and save it to `/plans/walkthroughs/2026-03-25_fix_vibelogger_walkthrough.md`.
