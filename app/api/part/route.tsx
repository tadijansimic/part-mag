import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import ElectronicComponent from '@/types/component-type';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const searchParams = url.searchParams.getAll('search');

    const parts = await (prisma as any).electronicComponent.findMany({}) as ElectronicComponent[];

    return NextResponse.json({ message: 'GET all parts', searchParams, parts });
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

        if (existingParts.length === 0) {
            const newPart = await (prisma as any).electronicComponent.create({
                data: {
                    mpn,
                    description,
                    place,
                    datasheet,
                    packaging,
                    count: 1,
                },
            });
            return NextResponse.json(newPart);
        } else if (existingParts.length === 1) {
            const updatedPart = await (prisma as any).electronicComponent.update({
                where: { id: existingParts[0].id },
                data: { count: existingParts[0].count + 1 },
            });
            return NextResponse.json(updatedPart);
        } else {
            return NextResponse.json({ error: 'Multiple parts with same MPN exist' }, { status: 500 });
        }
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
