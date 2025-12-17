import { ListingService } from '../services/listing.service';

// Мокаем модель Listing
jest.mock('../models/listing.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

import Listing from '../models/listing.model';

describe('ListingService', () => {
  let listingService: ListingService;

  beforeEach(() => {
    listingService = new ListingService();
    jest.clearAllMocks();
  });

  describe('getListings', () => {
    it('should return paginated listings', async () => {
      const mockListings = [
        { _id: '1', title: 'Test Listing 1', price: 100 },
        { _id: '2', title: 'Test Listing 2', price: 200 },
      ];

      (Listing.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockListings),
              }),
            }),
          }),
        }),
      });

      (Listing.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await listingService.getListings({ page: 1, limit: 10 });

      expect(result.listings).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should filter by category', async () => {
      (Listing.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      (Listing.countDocuments as jest.Mock).mockResolvedValue(0);

      await listingService.getListings({ category: 'insulin' });

      expect(Listing.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'insulin' })
      );
    });

    it('should sanitize search query', async () => {
      (Listing.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      (Listing.countDocuments as jest.Mock).mockResolvedValue(0);

      await listingService.getListings({ search: 'test.*query' });

      // Проверяем что regex экранирован
      expect(Listing.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({
              title: { $regex: 'test\\.\\*query', $options: 'i' },
            }),
          ]),
        })
      );
    });

    it('should limit pagination to max 100', async () => {
      (Listing.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      (Listing.countDocuments as jest.Mock).mockResolvedValue(0);

      await listingService.getListings({ page: 1, limit: 500 });

      // Проверяем что limit ограничен до 100
      expect(Listing.find().populate('').sort('').skip(0).limit).toHaveBeenCalledWith(100);
    });
  });

  describe('getListingById', () => {
    it('should return null for invalid ObjectId', async () => {
      const result = await listingService.getListingById('invalid-id');
      expect(result).toBeNull();
    });

    it('should return listing with incremented views', async () => {
      const mockListing = { _id: '507f1f77bcf86cd799439011', title: 'Test', views: 5 };
      
      (Listing.findByIdAndUpdate as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockListing),
        }),
      });

      const result = await listingService.getListingById('507f1f77bcf86cd799439011');

      expect(result).toEqual(expect.objectContaining({ title: 'Test' }));
      expect(Listing.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { views: 1 } },
        { new: true }
      );
    });
  });
});
