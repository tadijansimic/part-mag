"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    TextField,
    MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ProjectComponent({ project }: { project: Project }) {
    const [open, setOpen] = useState(false);

    // Kopija komponenti da se mogu lokalno menjati
    const [components, setComponents] = useState(project.components);

    // Dodavanje nove komponente
    const [adding, setAdding] = useState(false);
    const [newComponentId, setNewComponentId] = useState<number | "">("");
    const [newQuantity, setNewQuantity] = useState<number>(1);
    // TEMP — ovde ubaciš prave komponente iz baze
    const allComponents = [
        { id: 10, mpn: "1N4148", description: "Diode switching", count: 200 },
        { id: 21, mpn: "LM358", description: "Op Amp", count: 52 },
        { id: 53, mpn: "BC547", description: "NPN Transistor", count: 300 },
    ];

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const updateQuantity = (id: any, value: number) => {
        setComponents((prev) =>
            prev.map((pc) => (pc.id === id ? { ...pc, quantity: value } : pc))
        );
    };

    const deleteComponent = (id: any) => {
        setComponents((prev) => prev.filter((pc) => pc.id !== id));
    };

    const addComponent = () => {
        if (!newComponentId || newQuantity <= 0) return;

        const comp = allComponents.find((c) => c.id === newComponentId);
        if (!comp) return;

        setComponents((prev) => [
            ...prev,
            {
                id: Math.random(), // privremeni ID dok ne dobije iz baze
                componentId: comp.id,
                quantity: newQuantity,
                component: comp,
            },
        ]);

        setAdding(false);
        setNewComponentId("");
        setNewQuantity(1);
    };

    return (
        <>
            {/* Kartica */}
            <div
                onClick={handleClickOpen}
                className="block hover:bg-primary/30 m-2 p-4 border border-secondary/50 rounded-lg transition-colors duration-200 cursor-pointer"
            >
                <h2 className="mb-4 font-bold text-xl">{project.naziv}</h2>
                <p className="mb-2">
                    Opened At:{" "}
                    {new Date(project.openedAt || "").toLocaleDateString()}
                </p>
                <h3 className="mb-2 font-semibold text-lg">Components:</h3>
                <ul>
                    {project.components.map((pc) => (
                        <li key={pc.id} className="mb-1">
                            {pc.component.mpn} - {pc.component.description} (
                            Quantity: {pc.quantity})
                        </li>
                    ))}
                </ul>
            </div>

            {/* MUI Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "#222831",
                        color: "#EEEEEE",
                        borderRadius: "8px",
                    },
                }}
            >
                <DialogTitle>{project.naziv}</DialogTitle>

                <DialogContent dividers>
                    <p>
                        <strong>Opened At:</strong>{" "}
                        {new Date(project.openedAt || "").toLocaleDateString()}
                    </p>

                    <h4 className="mt-4 mb-2 font-semibold">Components:</h4>

                    <List>
                        {components.map((pc) => (
                            <ListItem
                                key={pc.id}

                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        onClick={() =>
                                            deleteComponent(pc.id)
                                        }
                                    >
                                        <DeleteIcon color="warning" />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={`${pc.component.mpn} - ${pc.component.description}`}
                                    secondary={`In stock: ${pc.component.count}`}
                                    sx={{
                                        "& .MuiTypography-root": { color: "#EEEEEE" },
                                        "& .MuiTypography-body2": { color: "#cccccc" }, // secondary
                                    }}
                                />


                                {/* Quantity input */}
                                <TextField
                                    type="number"
                                    size="small"
                                    value={pc.quantity}
                                    onChange={(e) =>
                                        updateQuantity(
                                            pc.id,
                                            Number(e.target.value)
                                        )
                                    }
                                    sx={{
                                        width: 90,
                                        ml: 2,
                                        input: { color: "#EEEEEE" },
                                        label: { color: "#222831" },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                borderColor: "#555",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#888",
                                            },
                                        },
                                    }}
                                />
                            </ListItem>
                        ))}

                        {/* Dugme + */}
                        {!adding && (
                            <ListItem sx={{ justifyContent: "center" }}>
                                <IconButton
                                    onClick={() => setAdding(true)}
                                    sx={{ color: "#4caf50" }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </ListItem>
                        )}

                        {/* Forma za dodavanje nove komponente */}
                        {adding && (
                            <ListItem>
                                <TextField
                                    select
                                    label="Component"
                                    size="small"
                                    value={newComponentId}
                                    onChange={(e) =>
                                        setNewComponentId(
                                            Number(e.target.value)
                                        )
                                    }
                                    sx={{
                                        minWidth: 180,
                                        mr: 2,
                                        input: { color: "#fff" },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                borderColor: "#555",
                                            },
                                        },
                                    }}
                                >
                                    {allComponents.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.mpn} – {c.description}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    type="number"
                                    label="Qty"
                                    size="small"
                                    value={newQuantity}
                                    onChange={(e) =>
                                        setNewQuantity(
                                            Number(e.target.value)
                                        )
                                    }
                                    sx={{
                                        width: 80,
                                        mr: 2,
                                        input: { color: "#fff" },
                                    }}
                                />

                                <Button
                                    onClick={addComponent}
                                    variant="contained"
                                >
                                    Add
                                </Button>

                                <Button
                                    onClick={() => setAdding(false)}
                                    sx={{ ml: 1 }}
                                >
                                    Cancel
                                </Button>
                            </ListItem>
                        )}
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: "#fff" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
