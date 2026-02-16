# 🟧 MOSAI

> **"Tu link in bio, pero bonito."**

Un mosaico visual de enlaces donde cada pieza es una imagen clicable. Simple, bonito, para todos.

## ✨ Características

- **100% visual** — Imágenes como protagonistas, no botones de texto
- **Badges informativos** — Sellos como "🔥 Finaliza pronto" o "✨ Nuevo"
- **5 temas visuales** — Clean, Midnight, Candy, Brutalist, Film
- **Drag & drop** — Reordena tu mosaico arrastrando las piezas
- **Mobile-first** — Diseñado para el tráfico que viene de Instagram

## 🛠 Stack Técnico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Auth & DB:** Supabase
- **Drag & Drop:** @dnd-kit
- **Deploy:** Vercel

## 🚀 Empezar

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd mosai
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ejecuta el schema en SQL Editor: `supabase/schema.sql`
4. Crea los storage buckets:
   - `avatars` (público, máx 2MB)
   - `piece-images` (público, máx 5MB)

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura

```
mosai/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── dashboard/        # Panel privado
│   └── [username]/       # Página pública (SSR)
├── components/
│   ├── ui/               # shadcn/ui
│   ├── auth/             # Formularios de auth
│   ├── dashboard/        # Componentes del dashboard
│   └── public/           # Componentes de la página pública
├── hooks/                # Custom hooks (usePieces, useProfile, useUpload)
├── lib/
│   ├── supabase/         # Clients (browser, server, middleware)
│   ├── types.ts          # TypeScript types
│   ├── themes.ts         # Definición de temas
│   ├── badges.ts         # Presets de badges
│   └── validations.ts    # Zod schemas
└── supabase/
    └── schema.sql        # SQL para crear tablas
```

## 🎨 Temas

| Tema | Descripción |
|------|-------------|
| **Clean** | Profesional, limpio, atemporal |
| **Midnight** | Elegante, nocturno, premium |
| **Candy** | Divertido, colorido, juguetón |
| **Brutalist** | Raw, artístico, atrevido |
| **Film** | Fotográfico, editorial, cinematográfico |

## 📝 Roadmap

- [x] Auth (email/password)
- [x] Dashboard con CRUD de piezas
- [x] Drag & drop para reordenar
- [x] 5 temas visuales
- [ ] Página pública con SSR
- [ ] Live preview en dashboard
- [ ] Settings de perfil
- [ ] Analytics de clics
- [ ] Login social

---

*MOSAI — Tu link in bio, pero bonito. 🟧*
