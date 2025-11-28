"use client";

import React, { useState, useEffect, useRef } from "react";
import RowConponent from "@/components/row-component";
import ElectronicComponent from "../types/component-type";
import ValidatedInput, { ValidatedInputRef } from "@/components/input-component";
import { Button, Checkbox, FormControlLabel, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import AddForm from "@/components/add-form";
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { ArrowRight } from "@mui/icons-material";
import { ArrowLeft } from "@mui/icons-material";


interface sortI {
    key: keyof ElectronicComponent;
    asc: boolean;
}

const pageSizeC = 12;

export default function Home() {
    const [components, setComponents] = useState<ElectronicComponent[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const searchInputRef = useRef<ValidatedInputRef>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [similar, setSimilar] = useState<boolean>(false);
    const [sortParams, setSortParams] = useState<sortI>({
        key: "mpn",
        asc: true
    })
    const [currentPage, setCurrentPage] = useState<number>(1);
    // Fetch parts from API 

    const fetchParts = async (q?: string, sim: boolean = similar, page: number = currentPage, pageSize: number = pageSizeC, key: keyof ElectronicComponent = sortParams.key, asc: boolean = sortParams.asc) => {
        if (!q) q = searchQuery;
        const res = await fetch(`/api/part?query=${encodeURIComponent(q)}&similar=${sim}&page=${page}&pageSize=${pageSize}&key=${key}&asc=${asc}`);
        const json = await res.json();
        const parts: ElectronicComponent[] = Array.isArray(json.parts) ? json.parts : [];
        setComponents(parts);
        // handleSort(sortParams.key, sortParams.asc, parts);
    }


    useEffect(() => {
        setCurrentPage(1);
        // console.log("Fetch parts due to searchQuery/similar change:", searchQuery, similar);
        fetchParts(searchQuery, similar);
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
        if (components.length === 0 || components.length > 1) {
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
        searchInputRef.current?.focus();
        setModalVisible(false);
        setTimeout(() => {
            setShowAddForm(false);
            console.log("AddForm zatvoren");
        }, 300);
    };

    const handleAddFormSubmit = async (comp: ElectronicComponent) => {
        searchInputRef.current?.focus();
        try {
            if (searchQuery.trim() === "") {
                closeAddForm();
                return;
            }
            comp.mpn = comp.mpn.toUpperCase();
            comp.packaging = comp.packaging?.toUpperCase() || "";
            comp.place = comp.place.toUpperCase();
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
    const handleSort = (key: keyof ElectronicComponent, asc: boolean, list?: ElectronicComponent[]) => {
        setSortParams({ key, asc });
        fetchParts(searchQuery, similar, currentPage, pageSizeC, key, asc);
        // const source = list ?? components;

        // const matching = source.filter(c => c.mpn === searchQuery.toUpperCase());
        // const nonMatching = source.filter(c => c.mpn !== searchQuery.toUpperCase());

        // const sortedMatching = [...matching].sort((a, b) => {
        //     const aVal = a[key] ?? "";
        //     const bVal = b[key] ?? "";
        //     if (typeof aVal === "number" && typeof bVal === "number") return asc ? aVal - bVal : bVal - aVal;
        //     return asc ? aVal.toString().localeCompare(bVal.toString()) : bVal.toString().localeCompare(aVal.toString());
        // });

        // const sortedNonMatching = [...nonMatching].sort((a, b) => {
        //     const aVal = a[key] ?? "";
        //     const bVal = b[key] ?? "";
        //     if (typeof aVal === "number" && typeof bVal === "number") return asc ? aVal - bVal : bVal - aVal;
        //     return asc ? aVal.toString().localeCompare(bVal.toString()) : bVal.toString().localeCompare(aVal.toString());
        // });

        // const sorted = [...sortedMatching, ...sortedNonMatching];
        // setComponents(sorted);

    };







    return (
        <div className="flex flex-col w-full h-full">
            {showAddForm && (
                <div
                    className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${modalVisible ? "opacity-100" : "opacity-0"} z-10 `}
                    onClick={() => {
                        searchInputRef.current?.focus();
                        closeAddForm();
                    }}
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
                    className="my-2 mr-4 grow"
                    ref={searchInputRef}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={similar}
                            onChange={() => {
                                setCurrentPage(1)
                                fetchParts(searchQuery, !similar);
                                setSimilar(!similar);
                            }}
                            color="primary"
                        />
                    }
                    label="Similar"
                />
                <Button variant="text" className="p-0" type="button" onClick={(e) => {
                    e.preventDefault();
                    setShowAddForm(true);
                    setTimeout(() => setModalVisible(true), 10);
                }}>
                    <AddIcon className="w-full" />
                </Button>
            </form>

            <div className="flex flex-col m-auto px-2 border-primary border-t border-b w-11/12 max-h-[90vh] overflow-auto text-lg border-collapse">
                <div className="items-center grid grid-cols-8 grid-rows-1 border-primary border-b w-full min-h-[50px]">

                    <a className="col-start-1 cursor-pointer" onClick={() => {
                        handleSort("mpn", sortParams.key == "mpn" ? !sortParams.asc : true);
                    }}>
                        <div className="flex items-center">MPN
                            {sortParams.key == "mpn" && sortParams.asc ? <ArrowUpward className="ml-2" /> : null}
                            {sortParams.key == "mpn" && !sortParams.asc ? <ArrowDownward className="ml-2" /> : null}
                        </div>
                    </a>
                    <a className="col-start-3 cursor-pointer" onClick={() => {
                        handleSort("description", sortParams.key == "description" ? !sortParams.asc : true);
                    }}>
                        <div className="flex items-center">Desc
                            {sortParams.key == "description" && sortParams.asc ? <ArrowUpward className="ml-2" /> : null}
                            {sortParams.key == "description" && !sortParams.asc ? <ArrowDownward className="ml-2" /> : null}
                        </div>
                    </a>
                    <a className="col-start-6 cursor-pointer" onClick={() => {
                        handleSort("packaging", sortParams.key == "packaging" ? !sortParams.asc : true);
                    }}>
                        <div className="flex items-center">Pck
                            {sortParams.key == "packaging" && sortParams.asc ? <ArrowUpward className="ml-2" /> : null}
                            {sortParams.key == "packaging" && !sortParams.asc ? <ArrowDownward className="ml-2" /> : null}
                        </div>
                    </a>
                    <a className="col-start-7 cursor-pointer" onClick={() => {
                        handleSort("count", sortParams.key == "count" ? !sortParams.asc : true);
                    }}>
                        <div className="flex items-center">Qtty
                            {sortParams.key == "count" && sortParams.asc ? <ArrowUpward className="ml-2" /> : null}
                            {sortParams.key == "count" && !sortParams.asc ? <ArrowDownward className="ml-2" /> : null}
                        </div>
                    </a>
                    <a className="col-start-8 cursor-pointer" onClick={() => {
                        handleSort("place", sortParams.key == "place" ? !sortParams.asc : true);
                    }}>
                        <div className="flex items-center">Place
                            {sortParams.key == "place" && sortParams.asc ? <ArrowUpward className="ml-2" /> : null}
                            {sortParams.key == "place" && !sortParams.asc ? <ArrowDownward className="ml-2" /> : null}
                        </div>
                    </a>

                </div>

                {components.map(comp => (
                    <RowConponent
                        exact={similar ? searchQuery.toUpperCase() : ""}
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
                        update={(updatedComp: ElectronicComponent) => {
                            fetchParts(searchQuery);
                        }}
                        q={searchQuery}
                    />

                ))}

            </div>
            <div className="flex justify-end items-center space-x-4 m-auto my-4 w-11/12 text-xl">
                <IconButton
                    disabled={currentPage === 1}
                    onClick={() => {
                        if (currentPage > 1) {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            fetchParts(searchQuery, similar, newPage);
                        }
                    }}>
                    <ArrowLeft
                        sx={{ fontSize: 60 }}
                        color="primary" />
                </IconButton>
                {currentPage}
                <IconButton
                    disabled={components.length < pageSizeC}
                    onClick={() => {
                        if (currentPage >= 1) {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            fetchParts(searchQuery, similar, newPage);
                        }
                    }}>
                    <ArrowRight
                        sx={{ fontSize: 60 }}
                        color="primary" />
                </IconButton>
            </div>
        </div >
    );
}
