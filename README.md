# Task Management API — NestJS migration

This directory is a parallel implementation; the original ASP.NET Core project is unchanged.

## Architecture and mapping

| ASP.NET Core | NestJS | Purpose |
|---|---|---|
| `AuthController` / `AuthService` / `JwtService` | `AuthController` / `AuthService` in `src/auth.ts` | register, login, refresh rotation, logout |
| `UserController` / `UserService` | `UserController` in `src/users.ts` | profile and admin user operations |
| `TaskController` / `TaskService` | `TaskController` in `src/tasks.ts` | task CRUD and ownership rules |
| `AppDbContext` / EF migrations | `prisma/schema.prisma` / Prisma Client | existing SQL Server tables and relationships |
| `[Authorize]`, role policies | `JwtGuard`, `AdminGuard` in `src/guards.ts` | JWT, token-version revocation, Admin role |
| `TaskDeadlineWorker` + `NotificationService` | `DeadlineWorker` in `src/worker.ts` | 30-second UTC deadline scan and atomic duplicate prevention |
| DTO/data annotations | `src/dto.ts` + global `ValidationPipe` | request validation |
| `appsettings.json` | `.env` / `ConfigModule` | secrets and connection settings |

Routes remain `/api/Auth/{register,login,refresh,logout}`, `/api/User`, and `/api/Task` with the same HTTP verbs and response field names. Enum values are serialized as the original JSON strings (`Todo`, `InProgress`, `Completed`, `Cancelled`, and the four priorities), while Prisma stores their original integer values.

## Database

Point `DATABASE_URL` at the existing `TasksManagement` SQL Server database. The screenshot shows `(localdb)\MSSQLLocalDB` with Windows Authentication; that is a named-pipe LocalDB endpoint, which Prisma’s SQL Server connector cannot use directly. Use a TCP-enabled SQL Server instance (normally SQL Server Express/Developer) with SQL authentication, for example `sqlserver://db-host:1433;database=TasksManagement;user=appuser;password=...;encrypt=true;trustServerCertificate=true`, or place a supported TCP proxy in front of LocalDB. Also create/apply the database first: the inspected `MSSQLLocalDB` instance currently has no `TasksManagement` database. Do not run `prisma migrate dev` against production: the schema is intentionally mapped to the existing EF tables (`Users`, `Task`, `RefreshTokens`, `Notifications`). Run `npx prisma db pull` first in a controlled environment if the deployed schema differs, then review the generated schema. No destructive migration is required for the current schema.

## Commands

```powershell
Copy-Item .env.example .env
npm install
npx prisma generate
npm run build
npm start
```

## Production deployment checklist

1. Provision a TCP-enabled SQL Server database named `TasksManagement`. LocalDB from Visual Studio is not suitable for the deployed Nest process because Prisma cannot use its named pipe.
2. Apply the original EF migrations once from the ASP.NET project, or restore a backup containing `Users`, `Task`, `RefreshTokens`, `Notifications`, and `__EFMigrationsHistory`.
3. In Botkeep, configure the variables in `.env.production.example`. Generate `JWT_SECRET` with a password generator and use a value of at least 64 random characters. Never commit `.env`.
4. Deploy this folder with build command `npm ci && npm run build` and start command `npm run start:prod`. The included `Dockerfile` and `Procfile` are also ready for platforms that support them.
5. Verify `GET /health` returns `{ "status": "ok", "database": "ok" }`, then test login and refresh rotation before switching the frontend over.

The application listens on `0.0.0.0` and honors the platform-provided `PORT`. Set `CORS_ORIGIN` to the exact frontend origin, including `https://` and without a trailing slash.

For Botkeep, set the same environment variables from `.env.example`, run `npm ci`, `npx prisma generate`, `npm run build`, and use `node dist/main.js` as the start command. Use a SQL Server connection string supported by the host (SQL authentication is normally required outside Windows-integrated LocalDB).

## Environment variables

`DATABASE_URL`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_DURATION_MINUTES`, `PORT`, and `CORS_ORIGIN` are required/used. Passwords remain bcrypt-compatible; the implementation uses `bcryptjs` to avoid native-binary deployment issues. No secret is committed in the new project.

## Verification status

The source was created without deleting the C# application. `npm install`, `npx prisma generate`, and `npm run build` now pass. The original EF migrations were applied successfully to `(localdb)\ProjectModels / TasksManagement`; all 12 migrations are present, with 4 users and 4 tasks. Nest startup and endpoint tests still require a reachable TCP SQL Server because Prisma cannot consume the LocalDB named pipe directly. The original EF migration history remains the authoritative schema source.

## Known translation differences

Prisma exposes SQL Server `datetime2`/`datetimeoffset` values as JavaScript `Date`; all writes use UTC (`new Date()`), and due-date comparisons are UTC instants. SQL Server serializable transactions are retained for refresh rotation, logout/reuse detection, role changes, and notification claiming. ASP.NET's exact middleware-generated validation error envelope can differ slightly from Nest's default `ValidationPipe` envelope, but status codes, messages, fields, and business outcomes are preserved.
