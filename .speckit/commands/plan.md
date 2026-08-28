# Command: /speckit.plan

**Purpose**: Generate a technical architecture plan (`plan.md`) grounded in an approved feature `spec.md`.

**Instructions for AI Agent**:
1. Read `specs/[feature-id]/spec.md`.
2. Define component trees, TypeScript data models, API endpoints, and technical constraints.
3. Use `.speckit/templates/plan-template.md`.
4. Save file to `specs/[feature-id]/plan.md`.
