export const getSlug = (slug: string) =>
  slug.toLowerCase().replace(/[^\w]+/g, '-')
export const escapeRegExp = (string: string): string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export const removeVersionPrefix = (text: string) =>
  text.replace(/^\d+(\.\d+)*\.?\s*/, '')
