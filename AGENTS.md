# Project Instructions

This project uses a layered frontend architecture.

Dependency direction:

`presentation -> application -> domain`

Additional rule:

- `infrastructure` implements contracts defined by `domain`
- `app` wires dependencies together and passes data into `presentation`
- `domain` must not import from `presentation`, `app`, or framework-specific UI code

## Source Structure

```txt
src/
├─ app/
│  ├─ App.tsx
│  └─ providers/
│
├─ presentation/
│  ├─ pages/
│  ├─ layouts/
│  └─ components/
│     ├─ portfolio/
│     └─ ui/
│
├─ domain/
│  ├─ entities/
│  ├─ repositories/
│  └─ models/
│
├─ application/
│  ├─ usecases/
│  └─ services/
│
├─ infrastructure/
│  ├─ api/
│  ├─ storage/
│  └─ repositories/
│
├─ hooks/
├─ store/
├─ utils/
├─ styles/
├─ assets/
└─ types/
```

## Architecture Flow

Expected flow for feature work:

1. Define business data in `domain`
2. Define or update repository contracts in `domain/repositories`
3. Create orchestration in `application/usecases`
4. Implement concrete data access in `infrastructure`
5. Render with React UI in `presentation`
6. Compose dependencies in `app`

Short rule:

`UI -> Application -> Domain`

`Infrastructure -> Domain`

`App -> Application + Infrastructure + Presentation`

## Import Direction Rules

Allowed:

- `app` may import from `presentation`, `application`, `infrastructure`, `domain`
- `presentation` may import from `application`, `domain`, `utils`, `types`, `styles`
- `application` may import from `domain`
- `infrastructure` may import from `domain` and technical helpers
- `hooks` may import from `application`, `domain`, `utils`, and React
- `store` may import from `application`, `domain`, `utils`

Forbidden:

- `domain` importing from `presentation`, `app`, `styles`, React UI, or browser UI code
- `application` importing from `presentation`
- `presentation` importing repository implementations directly from `infrastructure`
- page components constructing static feature data inline when that data belongs in a repository

## Current Placement Rules

- `presentation/pages`
  Page-level composition only
- `presentation/layouts`
  Shared page shell pieces such as site header or footer
- `presentation/components/ui`
  Reusable UI primitives such as buttons, containers, and section wrappers
- `presentation/components/portfolio`
  Portfolio-specific presentational sections
- `domain/models`
  Business-facing types and value structures
- `domain/entities`
  Aggregated feature entities such as page-level domain objects
- `domain/repositories`
  Contracts only, no implementation
- `application/usecases`
  Functions that coordinate domain contracts for a user-facing outcome
- `infrastructure/repositories`
  Static, mock, API-backed, or storage-backed repository implementations
- `utils`
  Generic helpers with no business ownership
- `types`
  Technical shared types only if they do not belong in `domain`

## Layer Rules

### `src/app`

- Use this layer to compose the application
- Instantiate repositories and call use cases here
- Do not place page-specific UI markup here

### `src/presentation`

- Use this layer for all React UI
- Pages orchestrate layouts and components
- Layouts define shared page shells such as header and footer
- Components contain reusable or feature-specific view logic
- Do not fetch or construct domain data directly here
- Do not instantiate infrastructure repositories here

### `src/domain`

- Put core entities, models, and repository contracts here
- Keep this layer framework-agnostic
- Do not use `ReactNode`, JSX, Tailwind classes, browser APIs, or UI imports here

### `src/application`

- Put use cases and application services here
- Use cases coordinate domain contracts
- No direct UI code in this layer

### `src/infrastructure`

- Put repository implementations, API clients, storage adapters, and external integrations here
- This layer may depend on `domain`
- If data is static for now, implement it as a repository here rather than placing it in `presentation`
- Keep mock or placeholder Figma content here until a real backend exists

### `src/hooks`

- Put reusable React hooks here only when they are shared across multiple presentation components
- If a hook is page-specific, colocate it with the presentation feature until it becomes shared

### `src/store`

- Put app-wide client state here only if state becomes shared across multiple pages or layouts
- Do not create global state preemptively

### `src/utils`

- Put framework-safe helpers here
- Keep helpers generic and side-effect free where possible

### `src/types`

- Put cross-layer technical types here only if they do not belong to `domain`
- Prefer `domain/models` for business-facing types

### `src/assets`

- Put local images, icons, and static files here
- If using remote assets temporarily, document the source in the repository implementation

## When Adding New Features

1. Define or update domain models first if the feature changes business data
2. Add or update repository contracts in `domain/repositories` if data access changes
3. Implement orchestration in `application/usecases`
4. Add concrete implementations in `infrastructure`
5. Render the result in `presentation`
6. Wire dependencies in `app`

## When Adding New Data

- Static or mock data must go through an infrastructure repository
- Do not hardcode feature data directly inside presentation pages
- If the source is temporary placeholder content from Figma, keep it in an infrastructure repository until a real API exists

## File Creation Rules

- If adding a new reusable visual primitive, create it in `src/presentation/components/ui`
- If adding a page-specific section, create it under the relevant feature path in `src/presentation/components`
- If adding a new business concept, start in `src/domain/models` or `src/domain/entities`
- If adding a new way to retrieve data, define the contract in `src/domain/repositories` first
- If adding static or mock content, implement it through `src/infrastructure/repositories`
- If a new folder is intentionally empty, prefer a short `README.md` over `.gitkeep`

## Styling Rules

- Tailwind only
- No inline CSS
- Prefer existing UI primitives in `src/presentation/components/ui`
- If a new UI pattern repeats, extract a component before duplicating markup

## Accessibility Rules

- Use semantic landmarks and heading order
- Use anchor tags for navigation and real links
- Use buttons only for actions
- All meaningful images require `alt`
