# API

## Auth
- POST `/api/v1/auth/register-tenant`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`

## Workspace
- GET `/api/v1/workspaces/me`
- POST `/api/v1/workspaces/invite`

## Projects
- GET `/api/v1/projects`
- POST `/api/v1/projects`
- PUT `/api/v1/projects/:id`

## Tasks
- GET `/api/v1/tasks/boards/:boardId`
- POST `/api/v1/tasks`
- PUT `/api/v1/tasks/:id`
- POST `/api/v1/tasks/:id/move`
- DELETE `/api/v1/tasks/:id`
- POST `/api/v1/tasks/:id/comments`

## Dashboard
- GET `/api/v1/dashboard/stats`
- GET `/api/v1/dashboard/notifications`
- GET `/api/v1/dashboard/billing/plan`
