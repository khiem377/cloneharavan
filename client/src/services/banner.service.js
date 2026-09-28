import api from '../lib/axios';

export const bannerService = {
    async getPublicBanners(type = 'hero') {
        try {
            const response = await api.get('/banners', {
                params: { type },
            });

            return (
                response.data?.data?.banners ||
                response.data?.data ||
                response.data ||
                []
            );
        } catch (error) {
            console.error(
                'Error fetching public banners:',
                error?.message
            );

            return [];
        }
    },

    async trackView(id) {
        try {
            await api.post(`/banners/${id}/view`);
        } catch (error) {
            console.error(
                'Error tracking banner view:',
                error?.message
            );
        }
    },

    async trackClick(id) {
        try {
            await api.post(`/banners/${id}/click`);
        } catch (error) {
            console.error(
                'Error tracking banner click:',
                error?.message
            );
        }
    },
};

export default bannerService;