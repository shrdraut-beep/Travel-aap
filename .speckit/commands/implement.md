# Command: /speckit.implement

**Purpose**: Execute code implementation based on an approved `tasks.md` and `plan.md`.

**Instructions for AI Agent**:
1. Read `specs/[feature-id]/tasks.md` and `specs/[feature-id]/plan.md`.
2. Implement code changes step by step using `view_file`, `edit_file`, and `create_file`.
3. Run `lint_applet` and `compile_applet` to verify zero errors.
4. Update task checkboxes in `tasks.md` upon completion.
