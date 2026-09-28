import bannerService from '../../services/banner.service';
import HeroBannerSliderClient from './HeroBannerSliderClient';

export default async function HomeHeroBannerSlider() {
  const slides = await bannerService.getPublicBanners('hero');

  if (!Array.isArray(slides) || slides.length === 0) {
    return null;
  }

  return <HeroBannerSliderClient slides={slides} />;
}