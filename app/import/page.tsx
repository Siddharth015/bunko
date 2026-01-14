import ImportClientWrapper from './import-client-wrapper';
import Navigation from '../components/Navigation';

export const metadata = {
    title: 'Import from Letterboxd | Bunko',
    description: 'Import your watch history from Letterboxd',
};

export default function ImportPage() {
    return (
        <>
            <Navigation />
            <ImportClientWrapper />
        </>
    );
}
