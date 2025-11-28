import { Project } from "@/types/project";
import ProjectComponent from "@/components/project-component";

export const projects: Project[] = [
    {
        id: 1,
        naziv: "Audio Pojačalo",
        openedAt: "2025-11-28T10:00:00.000Z",
        components: [
            {
                id: 1,
                projectId: 1,
                quantity: 3,
                component: {
                    id: 12,
                    mpn: "BC547",
                    description: "NPN transistor",
                    count: 10,
                    packaging: "TO-92",
                    datasheet: "https://example.com/ds/bc547.pdf",
                    place: "Drawer 1"
                }
            },
            {
                id: 2,
                projectId: 1,
                quantity: 1,
                component: {
                    id: 53,
                    mpn: "1N4148",
                    description: "Diode",
                    count: 20,
                    packaging: "DO-35",
                    datasheet: "https://example.com/ds/1n4148.pdf",
                    place: "Drawer 2"
                }
            }
        ]
    },
    {
        id: 2,
        naziv: "LED Kontroler",
        openedAt: "2025-11-20T15:30:00.000Z",
        components: [
            {
                id: 3,
                projectId: 2,
                quantity: 5,
                component: {
                    id: 71,
                    mpn: "WS2812B",
                    description: "RGB LED",
                    count: 50,
                    packaging: "SMD 5050",
                    datasheet: "https://example.com/ds/ws2812b.pdf",
                    place: "Drawer 3"
                }
            },
            {
                id: 4,
                projectId: 2,
                quantity: 2,
                component: {
                    id: 85,
                    mpn: "ATmega328P",
                    description: "Microcontroller",
                    count: 15,
                    packaging: "TQFP-32",
                    datasheet: "https://example.com/ds/atmega328p.pdf",
                    place: "Drawer 4"
                }
            }
        ]
    },
    {
        id: 3,
        naziv: "Napajanje 12V",
        openedAt: "2025-11-25T09:00:00.000Z",
        components: [
            {
                id: 5,
                projectId: 3,
                quantity: 2,
                component: {
                    id: 101,
                    mpn: "7805",
                    description: "Voltage Regulator",
                    count: 30,
                    packaging: "TO-220",
                    datasheet: "https://example.com/ds/7805.pdf",
                    place: "Drawer 5"
                }
            },
            {
                id: 6,
                projectId: 3,
                quantity: 4,
                component: {
                    id: 102,
                    mpn: "1000uF 25V",
                    description: "Electrolytic Capacitor",
                    count: 100,
                    packaging: "Radial",
                    datasheet: "https://example.com/ds/cap_1000uF.pdf",
                    place: "Drawer 6"
                }
            }
        ]
    }
];

export default async function projectsPage() {

    return (
        <div className="flex flex-row mx-auto mt-10 w-11/12">
            {projects.map((project) => (
                <ProjectComponent project={project} key={project.id} />
            ))}</div>
    );
}