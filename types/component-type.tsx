export default interface ElectronicComponent {
    id: number;
    mpn: string;
    description: string;
    count: number;
    place: string;
    datasheet?: string;
    packaging?: string;
}