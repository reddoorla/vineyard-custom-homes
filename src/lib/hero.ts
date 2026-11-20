// The page heroes' Vimeo ID fields (gallery, home ×2, About). An editor may
// paste the number itself or the video's Vimeo link; either gives the number.
// Anything else, empty included, keeps the hero's built-in video, so a page
// looks as it did before the field existed until someone fills it in.
export function vimeoIdOr(value: string | null | undefined, fallback: string): string {
  const id = value
    ?.trim()
    .match(/^(?:https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?)?(\d+)(?:[/?#].*)?$/);
  return id ? id[1] : fallback;
}
