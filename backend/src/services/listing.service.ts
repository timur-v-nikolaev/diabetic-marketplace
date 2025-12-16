import Listing, { IListingDocument } from '../models/listing.model';
import { IListing } from '../types/index';

export class ListingService {
  async createListing(data: Partial<IListing>): Promise<IListingDocument> {
    const listing = new Listing(data);
    return await listing.save();
  }

  async getListings(filters: any, userId?: string): Promise<{ listings: any[]; total: number; pages: number; page: number; totalPages: number }> {
    const query: any = { status: 'active' };

    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.city) {
      query.city = filters.city;
    }
    if (filters.minPrice && filters.maxPrice) {
      query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Параллельные запросы для ускорения
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('sellerId', 'name rating reviewsCount city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // lean() для лучшей производительности
      Listing.countDocuments(query)
    ])

    // Добавляем информацию о сохранении для каждого товара
    const listingsWithSaved = listings.map((listing: any) => {
      if (userId) {
        listing.isSaved = listing.savedBy?.some((id: any) => id.toString() === userId) || false;
      } else {
        listing.isSaved = false;
      }
      return listing;
    });

    return {
      listings: listingsWithSaved,
      total,
      pages: Math.ceil(total / limit),
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getListingById(id: string, userId?: string): Promise<any> {
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('sellerId', 'name rating reviewsCount city avatar phone')
    .lean();

    if (!listing) {
      return null;
    }

    // Добавляем информацию о том, сохранён ли товар текущим пользователем
    if (userId) {
      (listing as any).isSaved = listing.savedBy?.some((id: any) => id.toString() === userId) || false;
    } else {
      (listing as any).isSaved = false;
    }

    return listing;
  }

  async updateListing(id: string, data: Partial<IListing>, userId: string): Promise<IListingDocument> {
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.sellerId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    Object.assign(listing, data);
    return await listing.save();
  }

  async deleteListing(id: string, userId: string): Promise<IListingDocument | null> {
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.sellerId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    return await Listing.findByIdAndDelete(id);
  }

  async saveListing(listingId: string, userId: string): Promise<IListingDocument | null> {
    return await Listing.findByIdAndUpdate(
      listingId,
      { $addToSet: { savedBy: userId } },
      { new: true }
    );
  }

  async unsaveListing(listingId: string, userId: string): Promise<IListingDocument | null> {
    return await Listing.findByIdAndUpdate(
      listingId,
      { $pull: { savedBy: userId } },
      { new: true }
    );
  }

  async getSavedListings(userId: string): Promise<IListingDocument[]> {
    return await Listing.find({ savedBy: userId })
      .populate('sellerId')
      .lean();
  }

  async getSellerListings(sellerId: string): Promise<IListingDocument[]> {
    return await Listing.find({ sellerId })
      .populate('sellerId', 'name rating reviewsCount city avatar phone verificationStatus')
      .sort({ createdAt: -1 })
      .lean();
  }
}

export default new ListingService();
