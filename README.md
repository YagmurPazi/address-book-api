# Address Book API

SE 4458 – Assignment 2 (Group 1: Address Book) · Yağmur Pazı

A REST API for an address book: create, edit, update, delete, search, sort and favorite contacts.
There is no frontend; the API is documented and can be tried out with Swagger UI.

| | Link |
|---|---|
| Source code | https://github.com/YagmurPazi/address-book-api |
| Live API (Swagger UI) | https://address-book-api-xabr.onrender.com/api-docs |

> The live API runs on Render's free plan. After 15 minutes without traffic the service sleeps:
> the first request then takes about a minute and the data is reset to the demo contacts.

## Quick start

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # or: npm start
```

Then open http://localhost:3000/api-docs.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/contacts` | List contacts with search, filters, sorting and paging |
| GET | `/contacts/{id}` | Get one contact |
| POST | `/contacts` | Create a contact |
| PUT | `/contacts/{id}` | Replace a contact (all fields) |
| PATCH | `/contacts/{id}` | Edit some fields of a contact |
| DELETE | `/contacts/{id}` | Delete a contact |
| PUT | `/contacts/{id}/favorite` | Mark as favorite |
| DELETE | `/contacts/{id}/favorite` | Remove from favorites (the contact is kept) |

`GET /contacts` query parameters, all optional and combinable:

| Parameter | Values | Default |
|---|---|---|
| `search` | Words looked up in name, email and tags | – |
| `tag` | A tag, e.g. `Work` | – |
| `favorite` | `true` / `false` | – |
| `sortBy` | `firstName`, `lastName`, `email`, `createdAt` | `firstName` |
| `order` | `asc` / `desc` | `asc` |
| `page` | 1, 2, … | `1` |
| `pageSize` | 1–100 | `10` |

### Status codes

| Code | When |
|---|---|
| 200 | Success |
| 201 | Contact created |
| 400 | Invalid body, query parameter, id or JSON |
| 404 | No contact with that id |
| 409 | The email is already used by another contact |

## Design

The project started from the course's to-do template ([southriver/apiNode](https://github.com/southriver/apiNode))
and keeps its layered structure. Todo was replaced by Contact and the SQLite layer by an in-memory store.

**Stack:** Node.js, Express 5, swagger-ui-express with an OpenAPI 3.0 document written by hand
(`docs/openapi.json`), nodemon for development. Hosted on Render.

**Data model:** a contact has `firstName`, `lastName`, `email`, `phone`, `tags` and `isFavorite`,
plus `id`, `createdAt` and `updatedAt`, which are set by the server.

| Folder | Responsibility |
|---|---|
| `routes/` | HTTP endpoints: read the request, call the service, send the response |
| `dto/` | Validate and normalize request bodies and query strings; shape responses |
| `services/` | Business rules: unique email (409), PUT vs PATCH, favorites, filter/sort/page |
| `domain/` | The `Contact` model |
| `db/` | In-memory database (`InMemoryTable` keeps rows in a `Map`) and the 24 demo contacts |
| `utils/` | Text helpers for Turkish/English search and sorting |
| `docs/` | OpenAPI document served by Swagger UI |

- **Central error handling:** Express 5 forwards errors thrown in async handlers to one error handler in
  `index.js`, which turns them into JSON responses (400, 409, 500). Routes need no try/catch.
- **Storage behind one file:** services reach the data only through `db/contactDBContext.js`, so a real
  database could replace the in-memory store by rewriting that file, without changing services or routes.

## Assumptions

- **One shared address book, no authentication.** Everyone who calls the API sees the same contacts.
- **In-memory data.** Every restart, redeploy or sleep of the server resets the data to 24 made-up demo contacts.
- **Required fields:** only `firstName` and `lastName`.
- **Email is unique** (case-insensitive); phone numbers are not.
- **PUT replaces** the whole contact (optional fields left out are reset); **PATCH changes** only the fields that are sent.
- **Favorites** have their own endpoints (`PUT` / `DELETE /contacts/{id}/favorite`); `isFavorite` can also be set with POST, PUT or PATCH.
- **Search** looks in name, email and tags; every word must match. Search and the tag filter ignore case and Turkish letters (`yilmaz` finds Yılmaz).
- **Sorting** follows the Turkish alphabet (C < Ç < D).

## Issues encountered

1. **The template did not install on Node.js 26.** `npm install` failed while building `better-sqlite3`, which had
   no prebuilt binary for Node 26. The package was only used by an old, unused file, so both were removed;
   switching to the in-memory store later removed the other native package (`sqlite3`) too.
2. **Choosing a host for in-memory data.** On serverless platforms such as Vercel, requests can reach different
   instances that do not share memory, so new data could seem to disappear. Render runs one long-lived process;
   the trade-off is the free plan's sleep.
3. **Turkish letters in search.** `"İ".toLowerCase()` adds an invisible dot, so `ipek` did not match `İpek`, and
   `toLocaleLowerCase("tr")` turns the `I` in `EMILY` into `ı`. Both sides are now normalized the same way:
   accents removed, lower-cased, `ı` → `i` (`utils/text.js`).
4. **Turkish letters in sorting.** A plain string comparison puts names starting with Ç, Ö, Ş or Ü after Z;
   `Intl.Collator("tr")` sorts them in alphabet order.
5. **Non-ASCII characters in demo emails.** Two demo emails were first written with the Turkish `ı`.
   Lower-casing `MUSTAFA.YILMAZ@…` gives `mustafa.yilmaz@…` with a dotted i, which did not match the stored
   `mustafa.yılmaz@…`, so the duplicate-email check could be bypassed. The demo data now uses ASCII emails.

## Testing

The API was tested manually through Swagger UI and `curl`, locally and on the live deployment: all endpoints,
error cases (400, 404, 409), Turkish/English search, filters, sorting and paging.
