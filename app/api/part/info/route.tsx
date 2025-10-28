// app/api/datasheet/route.ts
import axios from 'axios';
import { load } from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

async function fetchPdfLink(url: string, baseUrl: string): Promise<string | null> {
    try {
        const { data: pageData } = await axios.get(url);
        const $pdf = load(pageData);

        const pdfLinkElement = $pdf('td a[href*=".pdf"]').first();

        const pdfLinkRelative = pdfLinkElement.attr('href');

        if (!pdfLinkRelative) {
            return null;
        }

        if (pdfLinkRelative.startsWith('http')) {
            return pdfLinkRelative;
        }

        return `${baseUrl}${pdfLinkRelative.startsWith('/') ? pdfLinkRelative : '/' + pdfLinkRelative}`;

    } catch (error) {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const word = req.nextUrl.searchParams.get('word');

    if (!word) {
        return NextResponse.json(
            { error: "Missing query parameter for search" },
            { status: 400 }
        );
    }

    const escapeRegex = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    try {
        const baseUrl = 'https://www.datasheet4u.com';
        const searchUrl = `${baseUrl}/share_search.php?sWord=${encodeURIComponent(word)}`;

        const { data } = await axios.get(searchUrl);
        const $ = load(data);

        const allArticles = $('article');
        let foundArticleElement: any | null = null;
        let datasheetPageRelativeLink: string | undefined;
        let articleDescription: string = 'Opis nije pronađen';

        const escapedWord = escapeRegex(word.trim());
        const wholeWordStrictRegex = new RegExp(`\\b${escapedWord}(?![-a-z0-9/.])\\b`, 'i');

        allArticles.each((index, element) => {
            if (foundArticleElement) {
                return false;
            }

            const articleText = $(element).text();

            if (wholeWordStrictRegex.test(articleText)) {
                foundArticleElement = element;

                const $article = $(foundArticleElement);
                const linkElement = $article.find('a').first();

                datasheetPageRelativeLink = linkElement.attr('href');
                articleDescription = linkElement.find('p').text().trim() || articleDescription;

                return false;
            }
        });

        if (!datasheetPageRelativeLink) {
            return NextResponse.json(
                { error: `Article matching the strict criteria for '${word}' was not found.` },
                { status: 404 }
            );
        }

        const datasheetPageUrl = `${baseUrl}${datasheetPageRelativeLink.startsWith('/') ? '' : '/'}${datasheetPageRelativeLink}`;

        const finalPdfLink = await fetchPdfLink(datasheetPageUrl, baseUrl);

        //! Nema pdf-a
        if (!finalPdfLink) {
            return NextResponse.json({
                query: word,
                description: articleDescription,
                datasheetUrl: null,
            }, { status: 200 });
        }
        //? Gas :)

        return NextResponse.json({
            query: word,
            description: articleDescription,
            datasheetUrl: finalPdfLink,
        }, { status: 200 });


    } catch (error) {

        return NextResponse.json(
            { error: 'Failed to complete search due to internal server error.' },
            { status: 500 }
        );
    }
}