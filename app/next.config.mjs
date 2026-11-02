// Nessuna indicizzazione: l'app è privata.
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  }
};

export default nextConfig;
