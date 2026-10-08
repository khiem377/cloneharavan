import { brandService } from './brand.service';

export const brandServerService = {
  getBrands: brandService.getServerBrands,
  getBrandBySlug: brandService.getServerBrandBySlug,
  getProductsByBrand: brandService.getServerProductsByBrand,
};

export default brandServerService;
