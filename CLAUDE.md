# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Conduit is an Angular implementation of the RealWorld "Medium.com clone" spec: user auth, full CRUD for articles and comments, tags, favorites, following, and paginated feeds. This repo is used as the application-under-test for Bondar Academy's test-automation training — expect students to write E2E/API tests against it, so avoid changes that alter routes, DOM structure/selectors, or API contracts without good reason.

Requires Node.js `^18.13.0 || ^20.9.0`.

## Commands

- `npm start` — run dev server at http://localhost:4200 (`ng serve`)
- `npm run build` — production build to `dist/angular-conduit`
- `npm test` — run unit tests via Karma/Jasmine (`ng test`)
- `npm run lint` — run Angular CLI lint (`ng lint --force`)
- Run a single spec: `ng test --include='**/path/to/file.spec.ts'`

Note: there are currently no `*.spec.ts` files in `src/`, so `npm test` runs an empty suite.

Husky + lint-staged run `prettier --write` on staged `*.{ts,html,css,json,md}` files at commit time.

## Architecture

Standalone-components Angular 18 app (no NgModules). Bootstrapped from `src/main.ts` via `appConfig` in `src/app/app.config.ts`, with routes lazy-loaded from `src/app/app.routes.ts` using `loadComponent`/`loadChildren`.

### Directory layout (`src/app`)

- `core/` — singleton, app-wide concerns: auth (`core/auth`), HTTP interceptors (`core/interceptors`), header/footer layout (`core/layout`), shared response/error models (`core/models`).
- `features/` — route-level feature areas, each with its own `pages/`, `components/`, `services/`, `models/` subfolders: `article`, `profile`, `settings`.
- `shared/` — cross-feature reusable pieces: components, directives, pipes (e.g. `markdown.pipe.ts` for rendering article bodies via `marked`).

### HTTP layer

Three functional interceptors run in this order (registered in `app.config.ts` via `provideHttpClient(withInterceptors([...]))`):

1. `apiInterceptor` — rewrites every relative request URL to prefix `https://conduit-api.bondaracademy.com/api` (the app always talks to the public Conduit demo API, not a local backend).
2. `tokenInterceptor` — attaches `Authorization: Token <jwt>` from `JwtService` (which persists the token in `localStorage`) when present.
3. `errorInterceptor` — unwraps HTTP errors, rethrowing `err.error` (the API's error body) instead of the raw `HttpErrorResponse`.

Feature services (e.g. `ArticlesService`, `TagsService`, `CommentsService`) call `HttpClient` with paths relative to the API root (e.g. `/articles/${slug}`) and rely on the interceptor chain above.

### Auth & state

`UserService` (`core/auth/services/user.service.ts`) is the source of truth for the current user, exposed as `currentUser` / `isAuthenticated` observables backed by a `BehaviorSubject`. It is seeded on app bootstrap by an `APP_INITIALIZER` (`initAuth` in `app.config.ts`) that calls `getCurrentUser()` if a JWT is already stored, so auth state is resolved before the app finishes bootstrapping.

Route guards use inline functional `canActivate` guards (`() => inject(UserService).isAuthenticated`), not guard classes. `IfAuthenticatedDirective` (`shared/directives`) conditionally renders template content based on auth state.

### Component conventions

- All components are `standalone: true` with explicit `imports: [...]` arrays; no shared/common module.
- Route-level page components are typically `export default class ...` to pair with dynamic `import()` in the router config.
- RxJS interop: `takeUntilDestroyed(inject(DestroyRef))` is the standard unsubscribe pattern (no manual `ngOnDestroy`/`Subject` teardown).
- `@rx-angular/template` (`RxLet`, etc.) is used in templates instead of Angular's built-in `*ngIf`/`async` pipe in places that need fine-grained rendering.
- `ArticleListConfig` (`features/article/models/article-list-config.model.ts`) is the shared shape passed into `ArticlesService.query()` to drive both the global feed and per-tag/per-author/favorited views — check this model before adding new list filtering behavior.
