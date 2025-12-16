import { Listing } from '../backend/src/types';
import { connectToDatabase } from '../backend/src/db/migrations';
import { ListingService } from '../backend/src/services/listing.service';

const seedListings: Listing[] = [
    {
        title: 'Глюкометр',
        description: 'Новый глюкометр с набором тест-полосок.',
        price: 1500,
        userId: 'user1',
    },
    {
        title: 'Инсулиновая помпа',
        description: 'Инсулиновая помпа в отличном состоянии.',
        price: 25000,
        userId: 'user2',
    },
    {
        title: 'Диабетические сладости',
        description: 'Ассорти диабетических сладостей.',
        price: 500,
        userId: 'user3',
    },
];

const seedDatabase = async () => {
    const db = await connectToDatabase();
    const listingService = new ListingService(db);

    for (const listing of seedListings) {
        await listingService.createListing(listing);
    }

    console.log('База данных успешно заполнена начальными данными.');
};

seedDatabase().catch((error) => {
    console.error('Ошибка при заполнении базы данных:', error);
});