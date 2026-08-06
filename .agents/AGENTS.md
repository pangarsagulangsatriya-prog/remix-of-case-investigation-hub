# Enterprise Investigation Hub - UI/UX Design Principles

This project requires a highly professional, dense, and "enterprise-grade" UI/UX. When adding or modifying components, all AI agents must strictly adhere to the following rules based on user preferences:

## 1. Modals vs. Drawers
- **Avoid Centered Modals** for complex data, long forms, or deep configurations.
- **Use Drawers** (like Shadcn `Sheet`) opening from the right side for heavy contextual interactions (e.g., Detail Analysis, Evidence Readiness, Node Settings).
- Drawers should take up a significant portion of the screen (e.g., 55-60% width) and use a structured, columnar layout to maximize reading space.

## 2. Row Interactions & Actions (Table/Timeline)
- Keep data rows clean, compact, and scannable. Do not clutter them with permanent action columns or headers.
- **Action Icons** (Detail, Edit, Delete) should be hidden by default and appear inline seamlessly on row hover (e.g., using `opacity-0 group-hover:opacity-100`).
- **Avoid Dropdown Menus** (like 3-dots/Ellipsis) for primary row actions. Place the icons directly in the cell for faster 1-click access.
- Use Native/Lucide Icons: `Eye` for Detail/History, `Pencil` for Edit, `Trash2` for Delete.
- Single clicking a row should only select the row. Require explicit icon clicks for actions, or double-clicks as a shortcut for editing.

## 3. Focus States (Inputs & Textareas)
- Do NOT use double borders, outer glow rings, or generic focus shadows.
- Ensure `outline: none` and `box-shadow: none` are applied to focus states.
- Default state: simple 1px neutral grey border (`border-slate-300`).
- Focus state: a sharp 1px or 2px colored border (`border-blue-500` or `border-emerald-500`) with NO `ring-*` classes. It should feel flat, precise, and crisp.

## 4. Form Field Simplification
- Avoid overly fragmented structured inputs unless strict validation is required.
- Combine logical fields into single free-text inputs where appropriate (e.g., merging "Time" and "Timezone" into a single text input with a placeholder like "Contoh: 14:30 WIB").
- This makes data entry faster and reduces visual clutter.
