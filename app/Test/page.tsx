"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

// Definicija tipa za podatke koje očekujemo od API-ja
interface DatasheetData {
    description: string;
    datasheetUrl: string;
}

// Možete koristiti ovaj tip i za greške
interface ErrorData {
    error: string;
}

export default function DatasheetFetcher() {
    const [data, setData] = useState<DatasheetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Deo koji želimo da pretražimo
    const partNumber = 'LM7805';

    useEffect(() => {
        // Definisanje asynchrone funkcije unutar useEffect-a
        const fetchDatasheet = async () => {
            setLoading(true); // Započni učitavanje
            setError(null);    // Resetuj prethodne greške

            try {
                // API putanja na klijentskoj strani
                const apiUrl = `/api/part/info?word=${partNumber}`;

                const response = await axios.get<DatasheetData>(apiUrl);

                // 1. **LOGOVANJE REZULTATA U KONZOLU PREGLEDAČA**
                console.log('✅ Podaci uspešno preuzeti (Client Log):', response.data);

                setData(response.data); // Postavljanje podataka u state

            } catch (err) {
                let errorMessage = 'Neuspelo preuzimanje podataka.';

                if (axios.isAxiosError(err) && err.response) {
                    // Izdvajanje poruke greške iz API-ja (npr. 404 ili 400)
                    const errorPayload = err.response.data as ErrorData;
                    errorMessage = errorPayload.error || `Greška statusa ${err.response.status}`;

                    // 2. **LOGOVANJE GREŠKE U KONZOLU PREGLEDAČA**
                    console.error(`❌ Greška prilikom poziva API-ja (Client Log): ${errorMessage}`, err.response.data);
                } else {
                    console.error('❌ Neočekivana greška (Client Log):', err);
                }

                setError(errorMessage); // Postavljanje greške u state

            } finally {
                setLoading(false); // Završi učitavanje
            }
        };

        fetchDatasheet();

        // Prazan niz [] osigurava da se ova funkcija pozove samo JEDNOM, nakon inicijalnog renderovanja.
    }, []);

    // --- Renderovanje sadržaja komponente ---

    if (loading) {
        return <div>Učitavanje datasheeta za {partNumber}...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Greška: {error}</div>;
    }

    if (!data) {
        return <div>Nema podataka za prikaz.</div>;
    }

    return (
        <div>
            <h3>Rezultat za deo: **{partNumber}**</h3>
            <p>
                **Opis:** {data.description}
            </p>
            <p>
                **Datasheet Link:** <a href={data.datasheetUrl} target="_blank" rel="noopener noreferrer">
                    {data.datasheetUrl}
                </a>
            </p>
        </div>
    );
}