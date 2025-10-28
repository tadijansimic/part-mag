"use client"
import Image from "next/image";
import RowConponent from "@/components/row-component";
import Component from '../types/component-type';
import { count } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import ElectronicComponent from "../types/component-type";
import { useEffect, useRef, useState } from "react";
import ValidatedInput, { ValidatedInputRef } from "@/components/input-component";

export default function Home() {
    const [components, setComponents] = useState<ElectronicComponent[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const searchInputRef = useRef<ValidatedInputRef>(null);
    async function fetchParts() {
        const res = await fetch("/api/part");
        const json = await res.json();
        const parts: ElectronicComponent[] = Array.isArray(json.parts) ? json.parts : [];

        setComponents(parts);
    }
    useEffect(() => {
        fetchParts();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.ctrlKey && e.key === "d") {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.reset();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, []);
    function setExpandedRowsF(id: number) {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    return (
        <div className="w-full h-full">
            <div className="text-3xl">Part Mag</div>
            <div className="flex flex-col m-auto px-2 border-primary border-t border-b w-11/12 max-h-[90vh] overflow-auto text-lg border-collapse">
                <ValidatedInput placeholder="Search..." className="my-2 w-full" ref={searchInputRef} />
                <div className="items-center grid grid-cols-8 grid-rows-1 border-primary border-b w-full min-h-[50px]">
                    <div className="col-start-1">MPN</div>
                    <div className="col-start-3">Desc</div>
                    <div className="col-start-6">Pck</div>
                    <div className="col-start-7">Qtty</div>
                    <div className="col-start-8">Place</div>
                </div>
                {components.map(comp => (
                    <RowConponent key={comp.id} comp={comp} expanded={expandedRows.has(comp.id)} setExpanded={setExpandedRowsF} update={fetchParts} />
                ))}
            </div>
        </div >
    );
}
