/** @type {import('next').NextConfig} */
const nextConfig = {
    // زيادة مهلة الانتظار للخوادم الخارجية (للسماح لـ Gemini بتحليل البيانات براحته)
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://kian-review-api.onrender.com/api/:path*', // توجيه الطلبات لخادم البايثون
            },
        ]
    },
    // تحديد أقصى مدة للانتظار (3 دقائق)
    staticPageGenerationTimeout: 180,
};

export default nextConfig;