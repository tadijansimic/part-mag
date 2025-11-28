import ElectronicComponent from "./component-type";

export interface ProjectComponent {
    id?: number;
    projectId?: number;
    // componentId: number;
    quantity: number;
    component: ElectronicComponent;
}

export interface Project {
    id?: number;             // id projekta
    naziv?: string;
    openedAt?: string;       // datum otvaranja
    components: ProjectComponent[];
}
