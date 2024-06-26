/**
 * @type {import("@cxnpl/next-app-middleware/runtime").RewriteHandler<{ locale: string }>}
 */
export default ({ params: { locale } }) => {
  return `/${locale}`;
};
