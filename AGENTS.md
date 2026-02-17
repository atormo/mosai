# MOSAI - Agent Context File

> Este archivo contiene toda la información necesaria para que cualquier agente o sesión futura pueda continuar el desarrollo de MOSAI exactamente donde se dejó.

---

## Proyecto

**MOSAI** — "Tu link in bio, pero bonito."
Un servicio de link-in-bio visual-first. En lugar de una lista de botones (Linktree), tu pagina es un mosaico de imagenes donde cada una es un link clicable. Grid estilo Instagram pero cada imagen lleva a un destino diferente.

**URL publica:** `mosai.link/username` (o dominio final)

---

## Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| UI Components | shadcn/ui (radix-ui) |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) con RLS |
| Storage | Supabase Storage (buckets: `avatars`, `piece-images`) |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Validacion | Zod v4 |
| Toasts | Sonner |
| Deploy target | Vercel |
| Fuentes | Plus Jakarta Sans (body), Fraunces (display), JetBrains Mono (code) |

---

## Nomenclatura

| Termino | Significado |
|---------|-------------|
| **MOSAI** | El servicio/producto |
| **Mosai** (tu mosai) | La pagina publica de un usuario |
| **Pieza** | Cada link visual individual (imagen + URL + badge) |
| **Badge** | Sello informativo superpuesto en una pieza |
| **Tema** | Estilo visual aplicado a la pagina publica |

---

## Estructura de archivos

```
mosai/
├── app/
│   ├── layout.tsx              # Root layout + fonts + Toaster
│   ├── page.tsx                # Redirect a /dashboard o /login
│   ├── globals.css             # Tailwind + brand colors
│   ├── (auth)/
│   │   ├── layout.tsx          # Layout centrado con branding
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx          # Header + container (client component)
│   │   ├── page.tsx            # Grid de piezas + CRUD + live preview
│   │   └── settings/page.tsx   # Perfil + tema + avatar
│   └── [username]/
│       ├── page.tsx            # Pagina publica (SSR)
│       └── not-found.tsx       # 404 custom
├── components/
│   ├── ui/                     # shadcn/ui (button, input, label, card, dialog, sheet, avatar, switch, badge, dropdown-menu, separator, sonner)
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/
│   │   ├── header.tsx          # Top bar con logo, avatar, copiar link, logout
│   │   ├── piece-card.tsx      # Card de pieza con acciones (edit, delete, toggle)
│   │   ├── piece-grid.tsx      # Grid con drag & drop
│   │   ├── piece-form.tsx      # Modal crear/editar pieza
│   │   ├── badge-picker.tsx    # Selector visual de badges
│   │   ├── image-uploader.tsx  # Upload con drag & drop + preview
│   │   ├── live-preview.tsx    # Simulacion movil del mosai
│   │   └── theme-picker.tsx    # Selector visual de 5 temas
│   └── public/
│       ├── mosai-header.tsx    # Avatar + nombre + bio
│       ├── mosai-grid.tsx      # Grid publico con tema aplicado
│       ├── mosai-piece.tsx     # Pieza individual (imagen + badge + link)
│       └── mosai-footer.tsx    # "Hecho con MOSAI"
├── hooks/
│   ├── use-pieces.ts           # CRUD + reorder de piezas (usa useMemo para supabase client)
│   ├── use-profile.ts          # Perfil del usuario (usa useMemo para supabase client)
│   └── use-upload.ts           # Upload de imagenes a Supabase Storage
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient
│   │   ├── server.ts           # createServerClient (SSR)
│   │   └── middleware.ts       # Auth middleware helper
│   ├── types.ts                # Profile, Piece, Badge, Theme interfaces
│   ├── utils.ts                # cn() helper
│   ├── themes.ts               # 5 temas: clean, midnight, candy, brutalist, film
│   ├── badges.ts               # 7 badge presets (none, urgency, new, promo, limited, course, custom)
│   └── validations.ts          # Zod schemas (register, login, profile, pieces)
├── supabase/
│   └── schema.sql              # SQL completo: tablas, RLS, triggers, storage policies
├── middleware.ts                # Proteger /dashboard, redirect auth, refresh session
├── next.config.ts
├── .env.local                  # Credenciales Supabase (NO commitear)
└── .env.example
```

---

## Base de datos (Supabase)

### Tabla: `profiles`
- `id` UUID (PK, FK → auth.users)
- `username` TEXT UNIQUE NOT NULL
- `display_name` TEXT NOT NULL
- `bio` TEXT (max 160)
- `avatar_url` TEXT
- `theme` TEXT (default 'clean')
- `created_at`, `updated_at` TIMESTAMPTZ

### Tabla: `pieces`
- `id` UUID (PK, auto-generated)
- `user_id` UUID (FK → profiles)
- `image_url` TEXT NOT NULL
- `destination_url` TEXT NOT NULL
- `title` TEXT (max 60)
- `badge_text` TEXT (max 24)
- `badge_type` TEXT (enum: none, urgency, new, promo, limited, course, custom)
- `badge_emoji` TEXT
- `position` INTEGER
- `is_active` BOOLEAN
- `created_at`, `updated_at` TIMESTAMPTZ

### Trigger automático
`handle_new_user()` → Se ejecuta AFTER INSERT en `auth.users`. Crea automaticamente el profile con username y display_name del metadata de signUp. Esto evita problemas de RLS al registrarse.

### Storage Buckets
- `avatars` — publico, max 2MB
- `piece-images` — publico, max 5MB

### RLS Policies
- Profiles: SELECT publico, INSERT/UPDATE solo owner
- Pieces: SELECT publico (activas) + owner (todas), INSERT/UPDATE/DELETE solo owner
- Storage: SELECT publico, INSERT/UPDATE/DELETE solo owner (por folder auth.uid())

---

## Supabase Config

- **Project URL:** `https://amcfecepfgavxwnjnvti.supabase.co`
- **Email confirmation:** DESACTIVADO (para desarrollo)
- **Email rate limit:** Subido a 10/h (default era 2)
- Las credenciales estan en `.env.local`

---

## Temas visuales

5 temas definidos en `lib/themes.ts`:

| Tema | Vibe | Fondo |
|------|------|-------|
| **Clean** (default) | Profesional, limpio | `#FAFAF8` |
| **Midnight** | Elegante, nocturno | `#0A0A0F` |
| **Candy** | Divertido, colorido | Gradiente pastel |
| **Brutalist** | Raw, artistico | `#F5F0EB` |
| **Film** | Fotografico, editorial | `#1A1A1A` |

Cada tema define: container, grid, piece, badge, header, text, hover, aspectRatio.

---

## Paleta de color (brand)

```
Primary:     #FF6B35 (naranja calido)
Secondary:   #1A1A2E (azul oscuro)
Accent:      #E8FF8B (lima)
Surface:     #FAFAF8 (off-white calido)
Muted:       #A3A3A3 (gris suave)
```

---

## Estado actual del desarrollo

### COMPLETADO

**Fase 1 — Fundacion**
- [x] Next.js + TypeScript + Tailwind CSS
- [x] shadcn/ui (12 componentes)
- [x] Supabase clients (browser, server, middleware)
- [x] Sistema de tipos completo
- [x] 5 temas visuales
- [x] 7 badge presets + custom
- [x] Validaciones Zod
- [x] SQL schema con RLS + trigger auto-create profile

**Fase 2 — Auth**
- [x] Layout de auth con branding
- [x] Login con validacion
- [x] Register con validacion de username en tiempo real (debounce 300ms)
- [x] Metadata en signUp para trigger de auto-creacion de perfil
- [x] Redirect automatico (auth → dashboard, no-auth → login)

**Fase 3 — Dashboard Core**
- [x] Header con avatar, copiar link, logout
- [x] Grid de piezas con drag & drop (@dnd-kit)
- [x] CRUD completo (crear, editar, eliminar piezas)
- [x] Image uploader con drag & drop
- [x] Badge picker visual
- [x] Toggle visible/oculto

**Fase 4 — UX Avanzado**
- [x] Live preview (frame movil)
- [x] Theme picker visual
- [x] Settings page (perfil + tema + avatar)

**Fase 5 — Pagina Publica**
- [x] Ruta [username] con SSR
- [x] Componentes publicos (header, grid, piece, footer)
- [x] Open Graph meta tags dinamicos
- [x] 404 custom

### PENDIENTE

**Fase 6 — Pulido final**
- [ ] Responsive: verificar dashboard en movil
- [ ] Loading states y skeletons en todo
- [ ] Error handling graceful
- [ ] Micro-animaciones: hover en piezas, badge pop-in, transitions
- [ ] Optimizacion de imagenes (sizes, priority flags)
- [ ] Testing manual en movil real

**Futuro (post-MVP)**
- [ ] Analytics de clics
- [ ] Landing page de marketing / pricing
- [ ] Planes de pago
- [ ] Dominio custom
- [ ] Login social (Google/Apple)
- [ ] Scheduling de piezas

---

## Bugs conocidos / Decisiones tecnicas

1. **Hooks `useProfile` y `usePieces`**: El cliente Supabase se crea con `useMemo(() => createClient(), [])` para evitar re-renders infinitos. NO cambiar esto.

2. **Registro**: El profile se crea via trigger de Supabase (`handle_new_user`), NO desde el cliente. El formulario de registro pasa username y display_name como `options.data` en `signUp`.

3. **Middleware deprecation warning**: Next.js 16 muestra warning sobre middleware → proxy. Funcional por ahora, migrar cuando sea estable.

4. **Zod v4**: El proyecto usa Zod 4.3.6. La API de `safeParse` devuelve `{ success, data?, error? }` donde `error.issues[0].message` para acceder al primer error.

5. **next/image**: Configurado para imagenes de `*.supabase.co` en `next.config.ts`.

---

## Como levantar el proyecto

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/tormius/dev/mosai
npm install
cp .env.example .env.local  # Editar con credenciales de Supabase
npm run dev
```

La app corre en `http://localhost:3000` (o 3001 si 3000 esta ocupado).

---

## Repo GitHub

`https://github.com/atormo/mosai`

---

## Plan completo del producto

El spec detallado con wireframes, flujos de usuario, y decisiones de diseno esta en `mosai-plan.md` en la raiz del proyecto.
