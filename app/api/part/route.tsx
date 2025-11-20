import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import ElectronicComponent from '@/types/component-type';

const prisma = new PrismaClient();

import * as cheerio from "cheerio";

export async function getTransistorSubstitutions(search: string): Promise<string[]> {
    if (!search) throw new Error("Missing search parameter");

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

    if (!exactLink) throw new Error("Exact transistor not found");

    const transistorUrl = (exactLink as string).startsWith("http")
        ? exactLink
        : `https://alltransistors.com/${exactLink}`;

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

    if (!substitutionLink) throw new Error("Substitution link not found");

    const subRes = await fetch(substitutionLink, { headers: { "User-Agent": "Mozilla/5.0" } });
    const subHtml = await subRes.text();
    const $$$ = cheerio.load(subHtml);

    const mpns: string[] = [];
    $$$("table tbody tr").each((_, el) => {
        const name = $$$(el).find("td a").first().text().trim();
        if (name) mpns.push(name);
    });

    return mpns;
}



export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const queries = url.searchParams.getAll("query").filter(q => q.trim() !== "");
    const similar = url.searchParams.get("similar") === "true";

    let parts: ElectronicComponent[] = [];

    if (queries.length === 0) {
        parts = await prisma.electronicComponent.findMany() as ElectronicComponent[];
    } else if (similar) {
        try {
            const similarMpns = await getTransistorSubstitutions(queries[0]);
            if (similarMpns.length > 0) {
                parts = await prisma.electronicComponent.findMany({
                    where: {
                        mpn: { in: similarMpns }
                    }
                }) as ElectronicComponent[];
            }
        } catch (err) {
            console.error("Failed to fetch similar transistors:", err);
            parts = [];
        }
    } else {
        const allParts = await prisma.electronicComponent.findMany() as ElectronicComponent[];

        function normalize(str?: string) {
            return (str ?? "").toLowerCase().replace(/[^\w\s]/g, ""); // uklanja sve osim slova, brojeva i space
        }

        const normalizedQuery = normalize(queries[0]);
        const lowerQueries = normalizedQuery.split(/\s+/).filter(q => q);

        parts = allParts.filter(part =>
            lowerQueries.every(q =>
                normalize(part.mpn).includes(q) ||
                normalize(part.description).includes(q) ||
                normalize(part.packaging).includes(q) ||
                normalize(part.place).includes(q)
            )
        ).sort((a, b) => {
            const getKey = (p: typeof allParts[0]) =>
                normalize(p.mpn) || normalize(p.description) || normalize(p.packaging) || normalize(p.place);
            return getKey(a).localeCompare(getKey(b));
        });




    }

    return NextResponse.json({ message: "GET filtered parts", queries, parts });
}






export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log(body);
    try {
        const { mpn, description = '', place = '', datasheet, packaging } = body;
        console.log(mpn, description, place, datasheet, packaging);
        if (!mpn) {
            return NextResponse.json({ error: 'mpn is required' }, { status: 400 });
        }

        const existingParts = await (prisma as any).electronicComponent.findMany({
            where: { mpn },
        });

        const newPart = await (prisma as any).electronicComponent.create({
            data: {
                mpn,
                description,
                place,
                datasheet,
                packaging,
                count: body.count ?? 1,
            },
        });
        return NextResponse.json(newPart);

    } catch (err) {
        return NextResponse.json({ error: 'Server error', details: err }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, mpn, description, place, datasheet, packaging, count } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const updatedPart = await (prisma as any).electronicComponent.update({
            where: { id },
            data: {
                mpn,
                description,
                place,
                datasheet,
                packaging,
                count,
            },
        });

        return NextResponse.json({ message: 'Part updated successfully', data: updatedPart });
    } catch (err) {
        return NextResponse.json({ error: 'Server error', details: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const deletedPart = await (prisma as any).electronicComponent.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Part deleted successfully', data: deletedPart });
    } catch (err) {
        return NextResponse.json({ error: 'Server error', details: (err as Error).message }, { status: 500 });
    }
}
