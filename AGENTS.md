# AI Agent Guidelines & Project Instructions

This project adheres to **Spec-Driven Development (SDD)** with **GitHub Spec-Kit**.

## Workflow Directive for AI Coding Agents
When developing new features or performing non-trivial refactoring, follow the SDD pipeline:

1. **Constitution (`/speckit.constitution`)**: Check `.speckit/constitution.md` for coding principles, type safety rules, and UI anti-slop guidelines.
2. **Specification (`/speckit.specify`)**: Create or check `specs/[feature-id]/spec.md` for functional requirements, scope boundaries, and acceptance criteria.
3. **Plan (`/speckit.plan`)**: Create or check `specs/[feature-id]/plan.md` for technical stack, schemas, and API contracts.
4. **Tasks (`/speckit.tasks`)**: Create or check `specs/[feature-id]/tasks.md` for an ordered checklist of actionable implementation steps.
5. **Implementation (`/speckit.implement`)**: Execute step-by-step code edits. Always verify with `lint_applet` and `compile_applet`.

## Available Spec-Kit Commands
- `/speckit.constitution`: Read or update project constitution rules
- `/speckit.specify`: Create feature specification
- `/speckit.plan`: Create technical implementation plan
- `/speckit.tasks`: Breakdown tasks into checklist
- `/speckit.implement`: Implement checklist items
- `/speckit.clarify`: Query ambiguities before coding
- `/speckit.analyze`: Verify code against spec compliance

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
