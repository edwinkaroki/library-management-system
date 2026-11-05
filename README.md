# Library Management System

A robust data layer for a library book catalog built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/) on PostgreSQL.

---

## 📚 Data Model Overview

The catalog models library users, book categories, books, and patron reviews using Prisma with PostgreSQL:

- **`Role` (Enum)**:
  - `PATRON`: General library patrons who can browse and review books.
  - `LIBRARIAN`: Administrative library staff managing catalog inventory and users.
- **`User`**:
  - Represents library patrons and librarians.
  - Fields: `id` (UUID), `email` (unique), `name`, `role` (`Role`, default `PATRON`), `reviews` (relation), `createdAt`, `updatedAt`.
- **`Genre`**:
  - Independent entity cataloging literary genres and categories.
  - Fields: `id` (UUID), `name` (unique), `description`, `books` (relation), `createdAt`, `updatedAt`.
- **`Book`**:
  - Represents catalog items in the library.
  - Fields: `id` (UUID), `title`, `author`, `isbn` (unique), `publishedYear`, `availableCopies`, `totalCopies`, `genreId` (foreign key), `genre` (`@relation`), `reviews` (relation), `createdAt`, `updatedAt`.
- **`Review` (Stretch Goal)**:
  - Extra relation connecting a `Book` and a `User` (Patron).
  - Fields: `id` (UUID), `rating` (Integer 1-5), `comment`, `bookId` (foreign key `@relation` to `Book`), `userId` (foreign key `@relation` to `User`), `createdAt`, `updatedAt`.

---

## 🛠️ Schema Decisions

### Why `Book` References `Genre` Rather Than Embedding It

In designing the book catalog schema, `Genre` is modeled as an independent relational table referenced by `Book` via a foreign key (`genreId`) with an `@relation` constraint, rather than embedded as a string, enum, or denormalized embedded object inside `Book`. This decision is driven by several relational and architectural best practices:

1. **Normalization & Elimination of Redundancy:**
   - Genres are shared across hundreds or thousands of books. Storing a freeform string or embedding genre metadata inside every `Book` record duplicates text data and leads to data inconsistencies (e.g., `"Sci-Fi"`, `"SciFi"`, `"Science Fiction"` creating fragmented categorizations).
   - By creating a standalone `Genre` model with a unique constraint on `name`, `Genre` serves as a single source of truth. Updating a genre name or description propagates across the entire catalog instantly without batch updates across millions of book records.

2. **Metadata Extensibility:**
   - A library genre represents more than a label; it frequently requires metadata such as descriptions, physical shelf/aisle location codes, target age brackets, or hierarchical parent-child relationships (e.g., *Fiction -> Speculative Fiction -> Science Fiction*).
   - A separate `Genre` table allows this metadata to evolve naturally without polluting or bloating the `Book` model.

3. **Referential Integrity & Constraints:**
   - The `@relation(fields: [genreId], references: [id])` foreign key constraint enforces relational integrity at the database engine level in PostgreSQL.
   - Books cannot be assigned non-existent genres (`ON DELETE RESTRICT`), preventing orphan records and guaranteeing catalog consistency across queries and transactions.

4. **Query Performance & Analytics:**
   - Fast filtering, grouping, and aggregations (such as counting total available books per genre or generating category navigation trees) can be performed directly on the `Genre` table or via indexed foreign key joins (`genreId`), avoiding expensive table-wide `DISTINCT` scans on large book collections.

---

## 🔄 Prisma vs. Document Database Modeling (Stretch Note)

Modeling this library catalog in Prisma with PostgreSQL highlights key philosophical and structural differences compared to modeling in a document database (such as MongoDB):

- **Explicit Relationships vs. Denormalized Embedding:**
  In a document database, related data is often embedded directly within the parent document (e.g., embedding an array of genres or review subdocuments inside a `Book` document) to optimize for single-document read performance without joins. In Prisma with PostgreSQL, relations are modeled explicitly with foreign keys (`genreId`, `userId`, `bookId`) and normalized tables.
- **Referential Integrity vs. Application-Level Guarantees:**
  In document databases, referential integrity across documents must typically be managed manually at the application layer. In Prisma on PostgreSQL, constraints (such as `@relation`, unique indexes, and foreign keys) are enforced strictly at the database layer.
- **Join Semantics & Type Safety:**
  Prisma provides declarative joins (`include` and `select`) with end-to-end static TypeScript type generation. You gain compile-time type safety for relation traversals (`book.genre`, `book.reviews`) without manually orchestrating aggregation pipelines or suffering from stale, duplicated embedded copies.

---

## 🚀 Setup, Migration & Seeding Instructions

### Neon PostgreSQL Project

This repository is linked to the Neon project [`library-management-system`](https://console.neon.tech/app/projects/nameless-surf-47683720/) in AWS Europe (Frankfurt). The initial migration has been applied to its `main` branch, and the seed data has been verified: **5 genres, 19 books, 3 users, and 2 reviews**.

Neon connection strings are credentials. Keep them in ignored local environment files; never commit them or paste them into source code.

### 1. Configure the Database URL

If you have the Neon CLI linked to this repository, pull the linked branch's environment directly into the API's ignored `.env` file from the repository root:

```powershell
neon env pull --file api/.env
```

Alternatively, copy the example and replace its placeholder with your PostgreSQL connection string:

```powershell
Copy-Item api\.env.example api\.env
```

For a fresh local checkout using Neon CLI, link the repository to the project and pull its variables:

```powershell
neon link --project-id nameless-surf-47683720 -y
neon env pull --file api/.env
```

### 2. Apply Migrations and Seed Data

Run these commands from the `api` directory:

```powershell
npx prisma migrate deploy
npx prisma db seed
```

The initial migration is checked in at `api/prisma/migrations`. The seed script is safe to rerun: it upserts genres, books, and users, and avoids adding duplicate sample reviews.

For local schema development, create additional migrations against a development database with `npx prisma migrate dev --name <migration-name>`.

### 3. Generate the Prisma Client

```powershell
npx prisma generate
```

### 4. Build & Test

```powershell
npm run build
npm run test
npm run lint
```
