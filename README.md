<div align="center"><h1><strong>SkillForge Admin Dashboard</strong></h1></div>
<div align="center">Built with the Next.js App Router</div>
<br />

## Overview

This is a starter template using the following stack:

- Framework - [Next.js 14](https://nextjs.org/13)
- Language - [TypeScript](https://www.typescriptlang.org)
- Styling - [Tailwind CSS](https://tailwindcss.com)
- Components - [Shadcn-ui](https://ui.shadcn.com)
- Schema Validations - [Zod](https://zod.dev)
- State Management - [Zustand](https://zustand-demo.pmnd.rs)
- Search params state manager - [Nuqs](https://nuqs.47ng.com/)
- Tables - [Tanstack Tables](https://ui.shadcn.com/docs/components/data-table)
- Forms - [React Hook Form](https://ui.shadcn.com/docs/components/form)
- Linting - [ESLint](https://eslint.org)
- Pre-commit Hooks - [Husky](https://typicode.github.io/husky/)
- Formatting - [Prettier](https://prettier.io)

## Pages

| Pages                                   | Specifications                                                                                                                      |
| :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| [Signup](/)                             | Authentication with **NextAuth** supports Social logins and email logins (Enter dummy email for demo).                              |
| [Dashboard](/dashboard)                 | Cards with recharts graphs for analytics.                                                                                           |
| [Employee](/dashboard/employee)         | Tanstack tables with server side searching, filter, pagination by Nuqs which is a Type-safe search params state manager in nextjs). |
| [Employee/new](/dashboard/employee/new) | A Employee Form with shadcn form (react-hook-form + zod).                                                                           |
| [Product](/dashboard/product)           | Tanstack tables with server side searching, filter, pagination by Nuqs which is a Type-safe search params state manager in nextjs   |
| [Product/new](/dashboard/product/new)   | A Product Form with shadcn form (react-hook-form + zod).                                                                            |
| [Profile](/dashboard/profile)           | Mutistep dynamic forms using react-hook-form and zod for form validation.                                                           |
| [Kanban Board](/dashboard/kanban)       | A Drag n Drop task management board with dnd-kit and zustand to persist state locally.                                              |
| [Not Found](/dashboard/notfound)        | Not Found Page Added in the root level                                                                                              |
| -                                       | -                                                                                                                                   |

## Getting Started

Follow these steps to clone the repository and start the development server:

- `git clone git@github.com:rzghorbani72/SkillForge-AdminPanel.git`
- `npm install`
- Create a `.env.local` file by copying the example environment file:
  `cp env.example.txt .env.local`
- Add the required environment variables to the `.env.local` file.
- `npm run dev`

You should now be able to access the application at http://localhost:4000.
