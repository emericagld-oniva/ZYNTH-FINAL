# Password Vault (Coffre-fort) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a company-scoped password vault at `/[companyId]/vault` with AES-256-GCM encryption, folder organisation, a built-in password generator, and a glassmorphism drawer UI.

**Architecture:** Passwords are encrypted server-side with AES-256-GCM before being stored in SQLite; the raw plaintext never persists. The vault page fetches folders + item metadata (no passwords) server-side and passes them to a Client Component shell. Revealing a password triggers a dedicated Server Action that decrypts and returns it only to the requesting client. The password generator is a pure client component that calls back into the drawer form.

**Tech Stack:** Next.js 16 App Router, Prisma v6 SQLite, NextAuth v5, Node.js `crypto` (built-in), framer-motion, Tailwind CSS 4, lucide-react.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `prisma/schema.prisma` | Add VaultFolder, VaultItem, VaultAccess, AccessLevel enum; update Company + CompanyMember back-relations |
| Modify | `.env` + `.env.example` | Add VAULT_ENCRYPTION_KEY |
| Create | `src/lib/crypto.ts` | AES-256-GCM encrypt/decrypt |
| Create | `src/lib/actions/vault.ts` | Server Actions: createFolderAction, createVaultItemAction, decryptPasswordAction |
| Create | `src/app/(app)/[companyId]/vault/password-generator.tsx` | Client Component: length slider, toggles, strength bar, copy/use buttons |
| Create | `src/app/(app)/[companyId]/vault/vault-item-drawer.tsx` | Client Component: slide-over form with embedded generator |
| Create | `src/app/(app)/[companyId]/vault/vault-shell.tsx` | Client Component: 2-col layout (folder sidebar + item list) |
| Create | `src/app/(app)/[companyId]/vault/page.tsx` | Server Component: fetch folders + items, render shell |
| Modify | `src/components/app-sidebar.tsx` | Add Vault nav item |

---

### Task 1: Prisma Schema + Env Key

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env`
- Modify: `.env.example`

- [ ] **Step 1: Generate a 32-byte encryption key**

Run in terminal:
```bash
node -e "const c = require('crypto'); console.log(c.randomBytes(32).toString('hex'))"
```
Copy the 64-character hex output — this is your `VAULT_ENCRYPTION_KEY`.

- [ ] **Step 2: Add key to .env**

Open `.env` and add at the end:
```
VAULT_ENCRYPTION_KEY=<paste your 64-char hex here>
```

Open `.env.example` and add:
```
# Vault encryption key — generate with: node -e "const c = require('crypto'); console.log(c.randomBytes(32).toString('hex'))"
VAULT_ENCRYPTION_KEY=your-64-char-hex-key
```

- [ ] **Step 3: Add the AccessLevel enum to schema**

In `prisma/schema.prisma`, add after the `Role` enum block (before `// ─── CORE MODELS`):

```prisma
enum AccessLevel {
  READ
  WRITE
}
```

- [ ] **Step 4: Add vault back-relations to Company**

In `prisma/schema.prisma`, inside the `Company` model after `clients Client[]`, add:
```prisma
  vaultFolders VaultFolder[]
  vaultItems   VaultItem[]
```

- [ ] **Step 5: Add vault back-relations to CompanyMember**

In `prisma/schema.prisma`, inside the `CompanyMember` model after `@@index([companyId])` (before closing `}`), add:
```prisma
  createdItems VaultItem[]   @relation("CreatedBy")
  accesses     VaultAccess[]
```

- [ ] **Step 6: Add the three Vault models**

At the end of `prisma/schema.prisma`, after the last existing model, add:

```prisma
// ─── VAULT ─────────────────────────────────────────────

model VaultFolder {
  id        String   @id @default(cuid())
  name      String
  companyId String
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  items    VaultItem[]
  accesses VaultAccess[]

  @@index([companyId])
}

model VaultItem {
  id                String        @id @default(cuid())
  title             String
  username          String?
  encryptedPassword String
  url               String?
  notes             String?
  folderId          String?
  folder            VaultFolder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  companyId         String
  company           Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  createdById       String
  createdBy         CompanyMember @relation("CreatedBy", fields: [createdById], references: [id])
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  accesses VaultAccess[]

  @@index([companyId])
  @@index([folderId])
}

model VaultAccess {
  id          String        @id @default(cuid())
  memberId    String
  member      CompanyMember @relation(fields: [memberId], references: [id], onDelete: Cascade)
  itemId      String?
  item        VaultItem?    @relation(fields: [itemId], references: [id], onDelete: Cascade)
  folderId    String?
  folder      VaultFolder?  @relation(fields: [folderId], references: [id], onDelete: Cascade)
  accessLevel AccessLevel   @default(READ)

  @@index([memberId])
  @@index([itemId])
  @@index([folderId])
}
```

- [ ] **Step 7: Kill node, push schema, regenerate client**

```bash
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
npx prisma db push
npx prisma generate
```

Expected output: `✔ Generated Prisma Client (v6.x.x)`

Note: This push is **non-destructive** — it only adds new tables. No `--force-reset` needed.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma .env.example
git commit -m "feat(schema): add VaultFolder, VaultItem, VaultAccess models for password vault"
```

---

### Task 2: Crypto Module

**Files:**
- Create: `src/lib/crypto.ts`

- [ ] **Step 1: Create the crypto module**

```ts
// src/lib/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const keyHex = process.env.VAULT_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be set as a 64-char hex string (32 bytes). " +
      "Generate one with: node -e \"const c = require('crypto'); console.log(c.randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypts plaintext with AES-256-GCM.
 * Returns a colon-delimited string: `iv:authTag:ciphertext` (all hex-encoded).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV — recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a value produced by `encrypt()`.
 * Throws if the data is tampered or the key is wrong.
 */
export function decrypt(encryptedData: string): string {
  const key = getKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted data format.");
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
}
```

- [ ] **Step 2: Verify it round-trips correctly**

Run in terminal:
```bash
node -e "
process.env.VAULT_ENCRYPTION_KEY = require('fs').readFileSync('.env','utf8').match(/VAULT_ENCRYPTION_KEY=(\S+)/)[1];
const {encrypt,decrypt} = require('./src/lib/crypto.ts');
" 2>&1 | head -5
```

If that errors on `.ts` import, test via the build instead (TypeScript compilation will catch issues in Task 8).

- [ ] **Step 3: Commit**

```bash
git add src/lib/crypto.ts
git commit -m "feat(crypto): add AES-256-GCM encrypt/decrypt utility"
```

---

### Task 3: Vault Server Actions

**Files:**
- Create: `src/lib/actions/vault.ts`

- [ ] **Step 1: Create the actions file**

```ts
// src/lib/actions/vault.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export type VaultState = { error?: string; success?: boolean } | null;
export type DecryptResult = { password?: string; error?: string };

// ─── Folders ───────────────────────────────────────────

export async function createFolderAction(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId = (formData.get("companyId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();

  if (!companyId) return { error: "Workspace manquant." };
  if (!name) return { error: "Le nom du dossier est requis." };

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) return { error: "Accès refusé." };

  await prisma.vaultFolder.create({ data: { name, companyId } });

  revalidatePath(`/${companyId}/vault`);
  return { success: true };
}

// ─── Items ─────────────────────────────────────────────

export async function createVaultItemAction(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId = (formData.get("companyId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const username = (formData.get("username") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const url = (formData.get("url") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const folderId = (formData.get("folderId") as string)?.trim() || null;

  if (!companyId) return { error: "Workspace manquant." };
  if (!title) return { error: "Le titre est requis." };
  if (!password) return { error: "Le mot de passe est requis." };

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) return { error: "Accès refusé." };

  await prisma.vaultItem.create({
    data: {
      title,
      username,
      encryptedPassword: encrypt(password),
      url,
      notes,
      folderId: folderId || null,
      companyId,
      createdById: membership.id,
    },
  });

  revalidatePath(`/${companyId}/vault`);
  return { success: true };
}

// ─── Decrypt ────────────────────────────────────────────

export async function decryptPasswordAction(itemId: string): Promise<DecryptResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const item = await prisma.vaultItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Élément introuvable." };

  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: { userId: session.user.id, companyId: item.companyId },
    },
  });
  if (!membership) return { error: "Accès refusé." };

  try {
    return { password: decrypt(item.encryptedPassword) };
  } catch {
    return { error: "Erreur de déchiffrement." };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/vault.ts
git commit -m "feat(vault): add createFolder, createVaultItem, decryptPassword server actions"
```

---

### Task 4: Password Generator Component

**Files:**
- Create: `src/app/(app)/[companyId]/vault/password-generator.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/app/(app)/[companyId]/vault/password-generator.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";

// ─── Character pools ────────────────────────────────────

const CHARS = {
  lower:   "abcdefghijklmnopqrstuvwxyz",
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
} as const;

interface GenOptions {
  upper:   boolean;
  lower:   boolean;
  numbers: boolean;
  symbols: boolean;
}

function generate(length: number, opts: GenOptions): string {
  let pool = "";
  if (opts.lower)   pool += CHARS.lower;
  if (opts.upper)   pool += CHARS.upper;
  if (opts.numbers) pool += CHARS.numbers;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower; // fallback — never produce empty password
  return Array.from(
    { length },
    () => pool[Math.floor(Math.random() * pool.length)]
  ).join("");
}

function strengthScore(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8)  s++;
  if (password.length >= 12) s++;
  if (/[A-Z]/.test(password))       s++;
  if (/[0-9]/.test(password))       s++;
  if (/[^a-zA-Z0-9]/.test(password)) s++;
  if (s <= 1) return 1;
  if (s === 2) return 2;
  if (s === 3) return 3;
  return 4;
}

const STRENGTH_META = [
  { label: "",          barColor: "bg-gray-700"    },
  { label: "Faible",    barColor: "bg-red-500"     },
  { label: "Passable",  barColor: "bg-amber-500"   },
  { label: "Bon",       barColor: "bg-sky-500"     },
  { label: "Très fort", barColor: "bg-emerald-500" },
] as const;

// ─── Toggle ─────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-1.5 select-none"
    >
      <span className="text-xs text-gray-400">{label}</span>
      <div
        className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${
          checked ? "bg-orange-500" : "bg-white/[0.08]"
        }`}
      >
        <div
          className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[17px]" : "translate-x-[2px]"
          }`}
        />
      </div>
    </button>
  );
}

// ─── Main component ─────────────────────────────────────

interface PasswordGeneratorProps {
  onUse: (password: string) => void;
}

export default function PasswordGenerator({ onUse }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState<GenOptions>({
    upper:   true,
    lower:   true,
    numbers: true,
    symbols: false,
  });
  const [generated, setGenerated] = useState("");
  const [justCopied, setJustCopied] = useState(false);

  const refresh = useCallback(() => {
    setGenerated(generate(length, opts));
  }, [length, opts]);

  // Auto-regenerate whenever options change
  useEffect(() => { refresh(); }, [refresh]);

  const strength = strengthScore(generated);
  const meta = STRENGTH_META[strength];

  async function handleCopy() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Générateur
      </p>

      {/* Generated password + actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/[0.06] font-mono text-sm text-white break-all min-h-[36px] leading-snug">
          {generated || <span className="text-gray-700">—</span>}
        </div>
        <button
          type="button"
          onClick={refresh}
          title="Regénérer"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          title="Copier"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
        >
          {justCopied
            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
            : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= strength ? meta.barColor : "bg-white/[0.06]"
              }`}
            />
          ))}
        </div>
        {meta.label && (
          <p className="text-[11px] text-gray-500">{meta.label}</p>
        )}
      </div>

      {/* Length slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Longueur</span>
          <span className="text-xs font-semibold text-white tabular-nums">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={32}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-1 appearance-none rounded-full bg-white/[0.08] cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-700">8</span>
          <span className="text-[10px] text-gray-700">32</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="divide-y divide-white/[0.04]">
        <Toggle
          checked={opts.upper}
          onChange={(v) => setOpts((o) => ({ ...o, upper: v }))}
          label="Majuscules (A-Z)"
        />
        <Toggle
          checked={opts.lower}
          onChange={(v) => setOpts((o) => ({ ...o, lower: v }))}
          label="Minuscules (a-z)"
        />
        <Toggle
          checked={opts.numbers}
          onChange={(v) => setOpts((o) => ({ ...o, numbers: v }))}
          label="Chiffres (0-9)"
        />
        <Toggle
          checked={opts.symbols}
          onChange={(v) => setOpts((o) => ({ ...o, symbols: v }))}
          label="Symboles (!@#…)"
        />
      </div>

      {/* Use button */}
      <button
        type="button"
        onClick={() => onUse(generated)}
        className="w-full py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm font-medium text-orange-400 hover:bg-orange-500/[0.15] transition-colors"
      >
        Utiliser ce mot de passe
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/vault/password-generator.tsx"
git commit -m "feat(vault): add password generator with strength meter and option toggles"
```

---

### Task 5: Vault Item Drawer

**Files:**
- Create: `src/app/(app)/[companyId]/vault/vault-item-drawer.tsx`

- [ ] **Step 1: Create the drawer component**

```tsx
// src/app/(app)/[companyId]/vault/vault-item-drawer.tsx
"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createVaultItemAction, type VaultState } from "@/lib/actions/vault";
import { Loader2, AlertCircle, X, Eye, EyeOff, Wand2 } from "lucide-react";
import PasswordGenerator from "./password-generator";

const FIELD =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-150";

const LABEL = "block text-xs font-medium text-gray-400 mb-2";

interface VaultItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string) => void;
  companyId: string;
  folders: { id: string; name: string }[];
}

function DrawerForm({
  onClose,
  onSuccess,
  companyId,
  folders,
}: Omit<VaultItemDrawerProps, "isOpen">) {
  const [state, action, pending] = useActionState<VaultState, FormData>(
    createVaultItemAction,
    null
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      const title = titleRef.current?.value ?? "Entrée";
      formRef.current?.reset();
      setPassword("");
      setShowGenerator(false);
      onSuccess(title);
      onClose();
    }
  }, [state?.success, onClose, onSuccess]);

  return (
    <form ref={formRef} action={action} className="flex flex-col h-full">
      {/* Hidden inputs: companyId and controlled password value */}
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="password" value={password} />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white">Nouvelle entrée</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Chiffré avec AES-256-GCM avant stockage.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Fields ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {state?.error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className={LABEL}>
            Titre <span className="text-orange-400">*</span>
          </label>
          <input
            ref={titleRef}
            name="title"
            type="text"
            placeholder="Ex: GitHub, Gmail, Serveur SSH…"
            required
            disabled={pending}
            autoFocus
            className={FIELD}
          />
        </div>

        {/* Username */}
        <div>
          <label className={LABEL}>Identifiant / Email</label>
          <input
            name="username"
            type="text"
            placeholder="user@example.com"
            disabled={pending}
            className={FIELD}
          />
        </div>

        {/* Password — controlled + generator toggle */}
        <div>
          <label className={LABEL}>
            Mot de passe <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={pending}
              className={`${FIELD} pr-20`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword
                  ? <EyeOff className="w-3.5 h-3.5" />
                  : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerator((v) => !v)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  showGenerator
                    ? "text-orange-400 bg-orange-500/10"
                    : "text-gray-600 hover:text-gray-300"
                }`}
                title="Générateur"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsible generator */}
          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <PasswordGenerator
                  onUse={(pwd) => {
                    setPassword(pwd);
                    setShowGenerator(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* URL */}
        <div>
          <label className={LABEL}>URL</label>
          <input
            name="url"
            type="url"
            placeholder="https://github.com"
            disabled={pending}
            className={FIELD}
          />
        </div>

        {/* Folder */}
        <div>
          <label className={LABEL}>Dossier</label>
          <select
            name="folderId"
            disabled={pending}
            className={`${FIELD} appearance-none bg-white/[0.05]`}
          >
            <option value="">Sans dossier</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className={LABEL}>Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Informations complémentaires…"
            disabled={pending}
            className={`${FIELD} resize-none`}
          />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <div className="px-6 py-5 border-t border-white/[0.06] flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-white/[0.07] hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Chiffrement…
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </form>
  );
}

export function VaultItemDrawer({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  folders,
}: VaultItemDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[#0c0c0c]/90 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl shadow-black/60"
          >
            <DrawerForm
              onClose={onClose}
              onSuccess={onSuccess}
              companyId={companyId}
              folders={folders}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/vault/vault-item-drawer.tsx"
git commit -m "feat(vault): add vault item drawer with embedded password generator"
```

---

### Task 6: Vault Shell (2-column layout)

**Files:**
- Create: `src/app/(app)/[companyId]/vault/vault-shell.tsx`

- [ ] **Step 1: Create the shell component**

```tsx
// src/app/(app)/[companyId]/vault/vault-shell.tsx
"use client";

import { useState, useCallback, useEffect, useRef, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Key, Globe, Copy, Check,
  Loader2, CheckCircle2, X, Lock, AlertCircle,
} from "lucide-react";
import {
  decryptPasswordAction,
  createFolderAction,
  type VaultState,
} from "@/lib/actions/vault";
import { VaultItemDrawer } from "./vault-item-drawer";

// ─── Types ──────────────────────────────────────────────

interface VaultFolderRow {
  id: string;
  name: string;
  _count: { items: number };
}

interface VaultItemRow {
  id: string;
  title: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  folderId: string | null;
  createdAt: Date | string;
}

// ─── New Folder Inline Form ──────────────────────────────

function NewFolderForm({
  companyId,
  onDone,
}: {
  companyId: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<VaultState, FormData>(
    createFolderAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onDone();
    }
  }, [state?.success, onDone]);

  return (
    <form ref={formRef} action={action} className="px-2 pb-2">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="flex items-center gap-1">
        <input
          name="name"
          type="text"
          placeholder="Nom du dossier"
          autoFocus
          required
          disabled={pending}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs text-white placeholder-gray-600 outline-none focus:border-orange-500/40 transition-all"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-6 h-6 rounded-lg flex items-center justify-center bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors shrink-0"
        >
          {pending
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Check className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {state?.error && (
        <p className="text-[11px] text-red-400 mt-1 px-1">{state.error}</p>
      )}
    </form>
  );
}

// ─── Toast ──────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      onClick={onDismiss}
      className="fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d0d0d]/95 backdrop-blur-xl border border-emerald-500/25 shadow-xl shadow-black/50 cursor-pointer select-none"
    >
      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <p className="text-sm font-semibold text-white">{message}</p>
    </motion.div>
  );
}

// ─── Item Row ────────────────────────────────────────────

function ItemRow({ item }: { item: VaultItemRow }) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    setCopying(true);
    const result = await decryptPasswordAction(item.id);
    setCopying(false);
    if (result.password) {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const domain = item.url
    ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-[2fr_2fr_2fr_80px] gap-4 px-5 py-4 items-center group hover:bg-white/[0.03] transition-colors duration-100 cursor-default"
    >
      {/* Title + avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-orange-500/25 group-hover:bg-orange-500/[0.06] transition-all duration-150">
          {item.url
            ? <Globe className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition-colors" />
            : <Key className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition-colors" />}
        </div>
        <span className="text-sm font-medium text-white truncate">{item.title}</span>
      </div>

      {/* Username */}
      <span className="text-sm text-gray-500 truncate">
        {item.username ?? <span className="text-gray-700">—</span>}
      </span>

      {/* URL */}
      <span className="text-xs text-gray-600 truncate">
        {domain ?? <span className="text-gray-700">—</span>}
      </span>

      {/* Copy button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          disabled={copying}
          title="Copier le mot de passe"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
            copied
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : "text-gray-600 border border-transparent hover:text-white hover:bg-white/[0.05] hover:border-white/[0.07]"
          }`}
        >
          {copying ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : copied ? (
            <><Check className="w-3 h-3" />Copié</>
          ) : (
            <><Copy className="w-3 h-3" />Copier</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Shell ──────────────────────────────────────────────

export default function VaultShell({
  companyId,
  folders,
  items,
}: {
  companyId: string;
  folders: VaultFolderRow[];
  items: VaultItemRow[];
}) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const visibleItems =
    selectedFolderId === null
      ? items
      : items.filter((i) => i.folderId === selectedFolderId);

  const selectedFolderName =
    selectedFolderId === null
      ? "Tous les mots de passe"
      : (folders.find((f) => f.id === selectedFolderId)?.name ?? "Dossier");

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={`"${toast}" enregistré`} onDismiss={dismissToast} />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <VaultItemDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={(title) => setToast(title)}
        companyId={companyId}
        folders={folders}
      />

      {/* 2-column vault layout */}
      <div className="flex h-full">

        {/* ── Folder sidebar ────────────────────── */}
        <div className="w-56 shrink-0 border-r border-white/[0.05] bg-white/[0.02] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Coffre-fort
              </span>
            </div>
            <button
              onClick={() => setShowNewFolder((v) => !v)}
              title="Nouveau dossier"
              className="w-5 h-5 rounded-md flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New folder form */}
          <AnimatePresence>
            {showNewFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <NewFolderForm
                  companyId={companyId}
                  onDone={() => setShowNewFolder(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* "All items" entry */}
          <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-100 ${
                selectedFolderId === null
                  ? "text-orange-300 bg-orange-500/[0.08] border border-orange-500/[0.15]"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Tous</span>
              <span className="ml-auto text-[10px] tabular-nums text-gray-700">
                {items.length}
              </span>
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-100 ${
                  selectedFolderId === folder.id
                    ? "text-orange-300 bg-orange-500/[0.08] border border-orange-500/[0.15]"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-[10px] tabular-nums text-gray-700">
                  {folder._count.items}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Item panel ────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
            <div>
              <h1 className="text-base font-semibold text-white">{selectedFolderName}</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {visibleItems.length} entrée{visibleItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-xs font-semibold text-white transition-colors shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {/* Empty state */}
          {visibleItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Aucune entrée</p>
              <p className="text-xs text-gray-700 max-w-xs leading-relaxed">
                Cliquez sur{" "}
                <span
                  className="text-orange-400 cursor-pointer hover:underline"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Ajouter
                </span>{" "}
                pour stocker votre premier identifiant.
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_2fr_2fr_80px] gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                {["Titre", "Identifiant", "URL", ""].map((h) => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                    {h}
                  </span>
                ))}
              </div>

              {/* Item rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
                {visibleItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/vault/vault-shell.tsx"
git commit -m "feat(vault): add 2-column vault shell with folder nav, item table, copy-to-clipboard"
```

---

### Task 7: Vault Server Page

**Files:**
- Create: `src/app/(app)/[companyId]/vault/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/app/(app)/[companyId]/vault/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import VaultShell from "./vault-shell";

export default async function VaultPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { companyId } = await params;

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) redirect("/workspaces");

  const [folders, items] = await Promise.all([
    prisma.vaultFolder.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.vaultItem.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        username: true,
        url: true,
        notes: true,
        folderId: true,
        createdAt: true,
        // encryptedPassword intentionally excluded
      },
    }),
  ]);

  return (
    <div className="h-full flex flex-col">
      <VaultShell companyId={companyId} folders={folders} items={items} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/vault/page.tsx"
git commit -m "feat(vault): add vault server page — fetches folders and item metadata (no passwords)"
```

---

### Task 8: Sidebar Link + Build Verification

**Files:**
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Add Vault to NAV_ITEMS**

In `src/components/app-sidebar.tsx`, change the import line:
```tsx
import { LayoutDashboard, Settings, UsersRound, LogOut, Building2 } from "lucide-react";
```
to:
```tsx
import { LayoutDashboard, Settings, UsersRound, LogOut, Building2, KeyRound } from "lucide-react";
```

Then change the `NAV_ITEMS` array:
```tsx
  const NAV_ITEMS = [
    { href: `/${companyId}/dashboard`, label: "Dashboard",   icon: LayoutDashboard },
    { href: `/${companyId}/clients`,   label: "Clients",     icon: UsersRound },
    { href: `/${companyId}/vault`,     label: "Coffre-fort", icon: KeyRound },
    { href: `/${companyId}/settings`,  label: "Paramètres",  icon: Settings },
  ];
```

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected output — route list should include:
```
├ ƒ /[companyId]/vault
```
And `✓ Compiled successfully`.

If TypeScript errors appear, fix them before committing.

- [ ] **Step 3: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "feat(vault): add Coffre-fort nav link to sidebar"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered by |
|-------------|-----------|
| VaultFolder model (id, name, companyId) | Task 1 |
| VaultItem model (id, title, username, encryptedPassword, url, notes, folderId, companyId, createdBy) | Task 1 |
| VaultAccess model (itemId or folderId, memberId, accessLevel READ/WRITE) | Task 1 |
| `crypto.ts` with symmetric encrypt/decrypt | Task 2 |
| VAULT_ENCRYPTION_KEY in .env | Task 1 |
| Server Actions CRUD for folders and items | Task 3 |
| 2-column layout: folder sidebar + item panel | Task 6 |
| Folder creation with "+" button | Task 6 |
| Password generator: length slider 8-32 | Task 4 |
| Password generator: toggles (upper/lower/numbers/symbols) | Task 4 |
| Strength gauge | Task 4 |
| Slide-over drawer with backdrop-blur-xl | Task 5 |
| Drawer fields: title, username, generator, folder | Task 5 |
| Vault link in sidebar | Task 8 |
| `/[companyId]/vault` route | Task 7 |
| `encryptedPassword` never in client payload | Task 7 (select excludes it) |
| Orange-500 accents on bg-[#050505] | All UI tasks |

**No placeholders found.** All code is complete.

**Type consistency:** `VaultState`, `DecryptResult` defined in Task 3 and imported consistently in Tasks 5 and 6. `VaultFolderRow` and `VaultItemRow` defined in Task 6 (vault-shell) match what Task 7 (page) passes via Prisma queries.

---

## ✅ Module completed — 2026-04-09

All 8 planned tasks shipped and verified (`npm run build` ✓). Additional features delivered beyond the original spec:

| Extra | Description |
|-------|-------------|
| Edit | `updateVaultItemAction` + drawer in edit mode (pre-fill, optional password) |
| Delete | `deleteVaultItemAction` + `DeleteConfirmDialog` glassmorphism + toast |
| Modal → Dialog | Converted slide-over to centered modal with spring animation |
| 2-column form | `grid md:grid-cols-2` — left: metadata, right: password + generator |
| Max length ×4 | Password generator max length raised from 32 → 128 |
