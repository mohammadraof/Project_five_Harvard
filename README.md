# Study Sprint Board

A small Kanban-style study planner built with plain JavaScript (no framework, no backend), [Vite](https://vite.dev/) and [Tailwind CSS](https://tailwindcss.com/).

Tasks live in three columns: **To Do**, **In Progress** and **Done**. Everything runs in the browser and is saved automatically.

## Getting started

Requires [Node.js](https://nodejs.org/).

```bash
npm install        # install dependencies
npm run dev        # start the dev server (prints a local URL)
npm run build      # create a production build in dist/
```

## Features

- Six starter tasks, shown in the correct columns on first load
- **Add** a task (title, subject, priority); new tasks start in To Do
- **Edit** a task's title, subject and priority (its id and column are kept)
- **Move** a task between columns with the status dropdown on each card
- **Delete** a task, with a confirmation prompt
- **Search** by title or subject (case-insensitive)
- **Filter** by priority (All / Low / Medium / High); search and priority filter work together
- **Clear Filters** button, shown only while a filter is active
- **Progress dashboard**: total count, count per column and completion percentage (Done / Total, 0% when there are no tasks). Counts always include every task, even ones hidden by a filter
- **Reset Board** restores the starter tasks (after confirmation)
- Form validation: title needs at least 3 characters, subject is required; errors appear next to the relevant input
- Accessible controls: labels on inputs, real buttons, visible keyboard focus, `aria-invalid` and `role="alert"` on errors, a `progressbar` role on the completion bar
- Responsive layout: columns stack on narrow screens; long words wrap inside cards
- User text is rendered with `textContent`, never as raw HTML

## Where data is saved

Tasks are stored in the browser's `localStorage` under the key `task4-study-board` as a JSON array. They are saved after every add, edit, move, delete and reset.

- If nothing has been saved yet, the starter tasks are used.
- A saved empty board stays empty after a refresh.
- If the saved data is corrupted or has an unexpected shape, it is discarded and the starter tasks are used instead.

## How it works

- **State:** the `tasks` array, plus `searchQuery`, `priorityFilter` and `editingId` for the UI state.
- **Rendering:** `renderBoard()` rebuilds the three columns from `tasks` and the current filters, then calls `renderStats()`.
- **Event handlers:** every handler that changes data updates `tasks`, calls `saveTasks()`, then calls `renderBoard()`. Cards are found by a stable, never-reused numeric `id`.

## Project structure

```
study-sprint-board/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── src/
│   ├── main.js
│   └── style.css
├── .gitignore
└── README.md
```

## Limitations

- Data is stored only in one browser on one device; clearing site data removes it
- Search text and the priority filter are not saved across refreshes
- Tasks are moved with a dropdown (there is no drag and drop)
- No due dates, no sorting options, no undo
- Delete and Reset use the browser's built-in confirmation dialog
