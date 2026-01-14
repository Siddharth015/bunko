import SearchClient from './search-client';
import Navigation from '../components/Navigation';

export const metadata = {
    title: 'Search | Bunko',
    description: 'Search across movies, anime, and books',
};

export default function SearchPage() {
    return (
        <>
            <Navigation />
            <SearchClient />
        </>
    );
}
