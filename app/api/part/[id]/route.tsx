import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const component = await prisma.electronicComponent.findUnique({
            where: { id }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        return NextResponse.json(component);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
