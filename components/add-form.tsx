"use client"

import React, { useEffect, useState, useRef } from "react";
import ValidatedInput, { ValidatedInputRef } from "./input-component";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ElectronicComponent from "@/types/component-type";

interface Props {
    onInit?: (component: ElectronicComponent) => void;
    onSubmit?: (component: ElectronicComponent) => void;
    mpn: string;
}

export default function AddForm({ mpn, onSubmit }: Props) {
    const [component, setComponent] = useState<ElectronicComponent>({
        id: 0,
        mpn: mpn,
        description: "",
        packaging: "",
        count: 1,
        place: "",
        datasheet: "",
    });
    const [validDatasheet, setValidDatasheet] = useState(false);

    const inputRefs = {
        mpn: useRef<ValidatedInputRef>(null),
        description: useRef<ValidatedInputRef>(null),
        packaging: useRef<ValidatedInputRef>(null),
        count: useRef<ValidatedInputRef>(null),
        place: useRef<ValidatedInputRef>(null),
        datasheet: useRef<ValidatedInputRef>(null),
    };

    useEffect(() => {
        inputRefs.mpn.current?.focus();
    }, []);
    useEffect(() => {
        setValidDatasheet(!!component.datasheet && component.datasheet.endsWith(".pdf"));
    }, [component.datasheet]);

    useEffect(() => {
        if (!component.mpn) return;

        const fetchDatasheet = async () => {
            try {
                const res = await fetch(`/api/part/info?word=${encodeURIComponent(component.mpn)}`);
                const data = await res.json();

                setComponent(prev => ({
                    ...prev,
                    datasheet: data.datasheetUrl || "",
                    description: data.description || "",
                }));
            } catch (err) {
                console.error("Error fetching datasheet for MPN:", err);
                setComponent(prev => ({ ...prev, datasheet: "", description: "" }));
            }
        };

        fetchDatasheet();
    }, [component.mpn]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allValid = Object.values(inputRefs).every(ref => ref.current?.validate());
        if (!allValid) {
            // console.log("Form is invalid");
            return;
        }

        const updatedComponent: ElectronicComponent = {
            id: component.id,
            mpn: inputRefs.mpn.current?.getValue() || "",
            description: inputRefs.description.current?.getValue() || "",
            packaging: inputRefs.packaging.current?.getValue() || "",
            count: Number(inputRefs.count.current?.getValue() || "0"),
            place: inputRefs.place.current?.getValue() || "",
            datasheet: inputRefs.datasheet.current?.getValue() || "",
        };

        if (onSubmit) onSubmit(updatedComponent);
    };

    return (
        <form
            className="flex flex-row gap-4 bg-background/90 backdrop-blur-md p-6 border-2 border-primary rounded-lg min-h-[50vh] overflow-auto"
            onSubmit={handleSubmit}
        >
            <div className="relative border-radius-lg w-3/4 h-[50vh] overflow-hidden text-foreground/50">
                <iframe
                    src={component.datasheet}
                    className={`absolute inset-0 w-full h-full border transition-opacity duration-500 ease-in-out
            ${validDatasheet ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                />
                <div
                    className={`absolute inset-0 flex justify-center items-center border border-primary border-dashed rounded-lg transition-opacity duration-500 ease-in-out
            ${validDatasheet ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                    No Datasheet Available
                </div>
            </div>

            <div className="w-1/4">
                <ValidatedInput
                    placeholder="MPN"
                    className="my-2"
                    ref={inputRefs.mpn}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            inputRefs.mpn.current?.reset();
                            setComponent(prev => ({ ...prev, mpn: "" }));
                        }
                    }}
                    onChange={(val) => setComponent(prev => ({ ...prev, mpn: val }))}
                    initialValue={component.mpn}
                    validator={[
                        (val: string) => val.length > 0,
                    ]}
                />
                <ValidatedInput
                    placeholder="Description"
                    className="my-2"
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            inputRefs.description.current?.reset();
                            setComponent(prev => ({ ...prev, description: "" }));
                        }
                    }}
                    onChange={(val) => setComponent(prev => ({ ...prev, description: val }))}
                    initialValue={component.description}
                    ref={inputRefs.description}
                    validator={[
                        (val: string) => val.length > 0,
                    ]}
                />
                <ValidatedInput
                    placeholder="Packaging"
                    className="my-2"
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            inputRefs.packaging.current?.reset();
                            setComponent(prev => ({ ...prev, packaging: "" }));
                        }
                    }}
                    onChange={(val) => setComponent(prev => ({ ...prev, packaging: val }))}
                    initialValue={component.packaging}
                    ref={inputRefs.packaging}
                    validator={[
                    ]}
                />
                <ValidatedInput
                    placeholder="Quantity"
                    className="my-2"
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            inputRefs.count.current?.reset();
                            setComponent(prev => ({ ...prev, count: 1 }));
                        }
                    }}
                    onChange={(val) => setComponent(prev => ({ ...prev, count: Number(val) }))}
                    initialValue={component.count.toString()}
                    ref={inputRefs.count}
                    validator={[
                        (val: string) => val.length > 0,
                        (val: string) => !isNaN(Number(val)),
                    ]}
                />
                <ValidatedInput
                    placeholder="Place"
                    className="my-2"
                    onChange={(val) => setComponent(prev => ({ ...prev, place: val }))}
                    initialValue={component.place}
                    ref={inputRefs.place}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            inputRefs.place.current?.reset();
                            setComponent(prev => ({ ...prev, place: "" }));
                        }
                    }}
                    validator={[
                        (val: string) => val.length > 0,
                    ]}
                />
                <ValidatedInput
                    placeholder="Datasheet URL"
                    className="my-2"
                    onChange={(val) => setComponent(prev => ({ ...prev, datasheet: val }))}
                    initialValue={component.datasheet}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "d") {
                            e.preventDefault();
                            inputRefs.datasheet.current?.reset();
                            setComponent(prev => ({ ...prev, datasheet: "" }));
                        }
                    }}
                    ref={inputRefs.datasheet}
                    validator={[
                        (val: string) => val.length === 0 || /^https?:\/\/.+\..+/.test(val),
                    ]}
                />
                <Button variant="contained" className="p-0 w-full" color="primary" type="submit" onKeyDown={(e) => {
                    if (e.key === "Tab") {
                        e.preventDefault();
                        inputRefs.mpn.current?.focus();
                    }
                }}>
                    <AddIcon className="w-full" />
                </Button>
            </div>
        </form>
    );
}
