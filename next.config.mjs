/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['img.clerk.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
            }
        ],
    },
};

export default nextConfig;
