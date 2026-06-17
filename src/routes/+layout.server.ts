import type { LayoutServerLoad } from "./$types";

export const prerender = "auto";

export const load: LayoutServerLoad = async ({ cookies }) => {
  // An active Prismic preview session is signalled by this cookie: editors who
  // arrive via a Prismic preview link have it set, normal visitors never do. We
  // only mount the Prismic toolbar for previewers (the toolbar sets ~21
  // third-party cookies that otherwise hit every visitor and fail Lighthouse).
  const isPreviewSession = !!cookies.get("io.prismic.preview");

  return {
    isPreviewSession,
  };
};
