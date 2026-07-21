@AGENTS.md

## File naming

Files under `components/` and `hooks/` use kebab-case (`aaa-bbb.tsx`), e.g.
`components/chat/message-bubble.tsx`, `hooks/use-chat.ts`. The exported
symbol inside still uses PascalCase/camelCase as normal (`export function
MessageBubble`, `export function useChat`) — only the filename is kebab-case.

Exception: Next.js App Router reserved filenames (`page.tsx`, `layout.tsx`,
`route.ts`, `loading.tsx`, `error.tsx`, etc.) and `globals.css` keep their
required names — renaming them breaks routing.
