/**
 * @type {import("@cxnpl/next-app-middleware/runtime").RewriteHandler<{ locale: string }>}
 */
const rewrite = ({ params: { locale } }) => {
  return `/${locale}`;
};

export default rewrite; 
