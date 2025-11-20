import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    if (!search) {
        return NextResponse.json({ error: "Missing search parameter" }, { status: 400 });
    }

    try {
        const searchUrl = `https://alltransistors.com/search.php?search=${encodeURIComponent(search)}`;
        const searchRes = await fetch(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const searchHtml = await searchRes.text();
        const $ = cheerio.load(searchHtml);

        let exactLink: string | null = null;
        $('a[href*="transistor.php"]').each((_, el) => {
            const text = $(el).text().trim().toLowerCase();
            if (text === search.toLowerCase()) {
                exactLink = $(el).attr("href") || null;
                return false;
            }
        });

        if (!exactLink) {
            return NextResponse.json({ error: "Exact transistor not found" }, { status: 404 });
        }

        const transistorUrl = `${exactLink}`;
        const transRes = await fetch(transistorUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const transHtml = await transRes.text();
        const $$ = cheerio.load(transHtml);

        let substitutionLink: string | null = null;
        $$("span.my-link").each((_, el) => {
            const text = $$(el).text().trim().toLowerCase();
            if (text.includes("substitution")) {
                const dataLink = $$(el).attr("data-link");
                if (dataLink) substitutionLink = dataLink.startsWith("//") ? `https:${dataLink}` : dataLink;
                return false;
            }
        });

        if (!substitutionLink) {
            return NextResponse.json({ error: "Substitution link not found" }, { status: 404 });
        }

        const subRes = await fetch(substitutionLink, { headers: { "User-Agent": "Mozilla/5.0" } });
        const subHtml = await subRes.text();
        const $$$ = cheerio.load(subHtml);

        const mpns: string[] = [];
        $$$("table tbody tr").each((_, el) => {
            const name = $$$(el).find("td a").first().text().trim();
            if (name) mpns.push(name);
        });

        return NextResponse.json({
            base: search,
            transistorUrl,
            substitutionUrl: substitutionLink,
            mpns,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch or parse data" }, { status: 500 });
    }
}
