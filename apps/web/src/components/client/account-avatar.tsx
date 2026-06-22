'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_AVATAR_DATA_URL_LEN } from '@golev/shared';
import { useUpdateMeAvatar } from '@/hooks/use-me';

/* ============================================================================
   Avatar da conta com troca de foto, persistida no banco. A imagem é
   redimensionada no client (256px, JPEG) e enviada como data URL — fica pequena
   (~20-30KB) e dentro do teto do servidor. Sem foto → iniciais do nome.
   ========================================================================== */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Redimensiona p/ 256px e comprime; baixa a qualidade até caber no teto. */
async function resizeToDataUrl(file: File): Promise<string | null> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('decode'));
    el.src = dataUrl;
  });
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  for (const q of [0.82, 0.7, 0.55, 0.4]) {
    const out = canvas.toDataURL('image/jpeg', q);
    if (out.length <= MAX_AVATAR_DATA_URL_LEN) return out;
  }
  return null;
}

export function AccountAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(avatarUrl);
  const update = useUpdateMeAvatar();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Escolha uma imagem.');
      return;
    }
    let url: string | null;
    try {
      url = await resizeToDataUrl(file);
    } catch {
      toast.error('Não foi possível usar essa imagem.');
      return;
    }
    if (!url) {
      toast.error('Imagem muito grande — tente outra.');
      return;
    }
    const prev = photo;
    setPhoto(url);
    update.mutate(
      { avatarDataUrl: url },
      {
        onSuccess: () => toast.success('Foto atualizada.'),
        onError: () => setPhoto(prev),
      },
    );
  }

  function remove() {
    const prev = photo;
    setPhoto(null);
    update.mutate(
      { avatarDataUrl: null },
      { onError: () => setPhoto(prev) },
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={update.isPending}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full transition-opacity hover:opacity-95 disabled:opacity-60"
          style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
          aria-label="Trocar foto"
        >
          {photo ? (
            <img src={photo} alt="Sua foto" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {initials(name)}
            </span>
          )}
        </button>
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', color: 'var(--gl-primary)' }}
        >
          <Camera className="h-3.5 w-3.5" />
        </span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onPick(e)} />
      </div>
      {photo && (
        <button
          type="button"
          onClick={remove}
          disabled={update.isPending}
          className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70 disabled:opacity-50"
          style={{ color: 'var(--gl-ink-3)' }}
        >
          <Trash2 className="h-3 w-3" /> Remover foto
        </button>
      )}
    </div>
  );
}
