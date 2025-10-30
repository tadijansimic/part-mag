"use client";

import React, { useState, useEffect, useRef } from "react";
import RowConponent from "@/components/row-component";
import ElectronicComponent from "../types/component-type";
import ValidatedInput, { ValidatedInputRef } from "@/components/input-component";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import AddForm from "@/components/add-form";

export default function Home() {
    const [components, setComponents] = useState<ElectronicComponent[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const searchInputRef = useRef<ValidatedInputRef>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch parts from API
    async function fetchParts(q?: string) {
        const res = await fetch(`/api/part?query=${encodeURIComponent(q || "")}`);
        const json = await res.json();
        const parts: ElectronicComponent[] = Array.isArray(json.parts) ? json.parts : [];
        setComponents(parts);
    }

    useEffect(() => {
        fetchParts(searchQuery);
    }, [searchQuery]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === "Escape" && showAddForm) {
                closeAddForm();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showAddForm]);

    // Expand/collapse row
    function setExpandedRowsF(id: number) {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }

    // Modal control
    const openAddForm = async () => {
        if (components.length === 0) {
            setShowAddForm(true);
            setTimeout(() => setModalVisible(true), 10);
        }
        else if (components.length === 1 && components[0].mpn.toUpperCase() === searchQuery.toUpperCase()) {
            try {
                components[0].count += 1;
                const res = await fetch("/api/part", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(components[0]),
                });

                const data = await res.json();
                fetchParts(searchQuery);
                if (!res.ok) {
                    console.error("Error updating component:", data);
                } else {
                    console.log("Component updated successfully:", data);
                }
            } catch (err) {
                console.error("Network error:", err);
            }

        }
    };

    const closeAddForm = () => {
        setModalVisible(false);
        setTimeout(() => {
            setShowAddForm(false);
            console.log("AddForm zatvoren");
        }, 300);
    };

    const handleAddFormSubmit = async (comp: ElectronicComponent) => {
        try {
            if (searchQuery.trim() === "") {
                closeAddForm();
                return;
            }
            comp.mpn = comp.mpn.toUpperCase();
            const res = await fetch("/api/part", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(comp),
            });
            if (!res.ok) {
                const err = await res.json();
                console.error("Error submitting part:", err);
                return;
            }
            await res.json();
            fetchParts(searchQuery);
            closeAddForm();
        } catch (err) {
            console.error(err);
            closeAddForm();
        }
    };


    return (
        <div className="flex flex-col w-full h-full">
            {showAddForm && (
                <div
                    className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${modalVisible ? "opacity-100" : "opacity-0"} z-10 `}
                    onClick={closeAddForm}
                >
                    <div
                        className="w-1/2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AddForm
                            mpn={searchQuery}
                            onSubmit={handleAddFormSubmit}
                        />
                    </div>
                </div>
            )}




            <div className="mt-5 ml-5 text-3xl">Part Mag</div>
            <hr className="mt-5 border-primary" />

            <form
                className="flex flex-row m-auto mt-5 w-11/12 text-lg"
                onSubmit={(e) => { e.preventDefault(); openAddForm(); }}
            >
                <ValidatedInput
                    onChange={(val) => setSearchQuery(val)}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            searchInputRef.current?.reset();
                            setSearchQuery("");
                        }
                    }}
                    placeholder="Search..."
                    className="my-2 grow"
                    ref={searchInputRef}
                />
                <Button variant="text" className="p-0" type="submit" >
                    <AddIcon className="w-full" />
                </Button>
            </form>

            <div className="flex flex-col m-auto px-2 border-primary border-t border-b w-11/12 max-h-[90vh] overflow-auto text-lg border-collapse">
                <div className="items-center grid grid-cols-8 grid-rows-1 border-primary border-b w-full min-h-[50px]">
                    <div className="col-start-1">MPN</div>
                    <div className="col-start-3">Desc</div>
                    <div className="col-start-6">Pck</div>
                    <div className="col-start-7">Qtty</div>
                    <div className="col-start-8">Place</div>
                </div>

                {components.map(comp => (
                    <RowConponent
                        onDelete={async () => {
                            try {
                                const res = await fetch("/api/part", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: comp.id }),
                                });
                                if (!res.ok) {
                                    const err = await res.json();
                                    console.error("Error deleting part:", err);
                                    return;
                                }
                                await res.json();
                                fetchParts(searchQuery);
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                        key={comp.id}
                        comp={comp}
                        expanded={expandedRows.has(comp.id)}
                        setExpanded={setExpandedRowsF}
                        update={fetchParts}
                    />
                ))}
            </div>
        </div>
    );
}
