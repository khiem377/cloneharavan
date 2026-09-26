import serverApi from '../lib/serverAxios';

export const bannerServerService = {
    async getPublicBanners(type = 'hero') {
        try {
            const response = await serverApi.get('/banners', {
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
};

export default bannerServerService;