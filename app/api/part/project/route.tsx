import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET() {
    try {
        const projects = await (prisma as any).project.findMany({
            include: {
                components: {
                    include: {
                        component: true, // ovo vraća sve podatke iz electronicComponent
                    },
                },
            },
        });

        // Mapiranje da se lepo vrati projekat sa poljima: id, naziv, datumOtvaranja i niz komponenti sa svim podacima
        const result = projects.map((p: any) => ({
            id: p.id,
            naziv: p.naziv,
            datumOtvaranja: p.openedAt, // ili p.datumOtvaranja ako si promenio ime polja
            components: p.components.map((c: any) => ({
                id: c.id,
                quantity: c.quantity,
                projectId: c.projectId,
                component: {
                    id: c.component.id,
                    mpn: c.component.mpn,
                    description: c.component.description,
                    count: c.component.count,
                    packaging: c.component.packaging,
                    datasheet: c.component.datasheet,
                    place: c.component.place,
                },
            })),
        }));

        return NextResponse.json(result);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST - kreiranje projekta i skidanje komponenti iz lagera
export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { naziv, components } = data;
        // components = [{ componentId, quantity }]

        // 1. Provera da li ima dovoljno u lageru
        for (const item of components) {
            const comp = await prisma.electronicComponent.findUnique({
                where: { id: item.componentId }
            });

            if (!comp) {
                return NextResponse.json(
                    { error: `Component ID ${item.componentId} does not exist.` },
                    { status: 400 }
                );
            }

            if (comp.count < item.quantity) {
                return NextResponse.json(
                    {
                        error: `Not enough quantity of component ${comp.mpn}. Needed ${item.quantity}, available ${comp.count}.`
                    },
                    { status: 400 }
                );
            }
        }

        // 2. Kreiraj projekat
        const project = await (prisma as any).project.create({
            data: {
                naziv,
                components: {
                    create: components.map((c: any) => ({
                        componentId: c.componentId,
                        quantity: c.quantity
                    }))
                }
            }
        });

        // 3. Skini komponente iz lagera
        for (const item of components) {
            await prisma.electronicComponent.update({
                where: { id: item.componentId },
                data: {
                    count: { decrement: item.quantity }
                }
            });
        }

        return NextResponse.json(project);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
