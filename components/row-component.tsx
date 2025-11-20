"use client"

import ElectronicComponent from '@/types/component-type';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Alert, Button, IconButton, Snackbar } from "@mui/material"
import { useRef, useState } from 'react';
import TextField from "@mui/material/TextField";
import ValidatedInput, { ValidatedInputRef } from './input-component';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
    className?: string
    comp: ElectronicComponent,
    expanded: boolean,
    setExpanded?: (id: number) => Promise<void> | void,
    update?: (updatedComp: ElectronicComponent) => void | Promise<void>;
    onDelete?: () => void,
    q: string,
    exact: string;
}

async function updateComponent(
    updatedComp: ElectronicComponent,
    q: string,
    update?: (updated: ElectronicComponent) => void,
    setToast?: (toast: ToastInfo | null) => void
) {
    try {
        const res = await fetch("/api/part", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedComp),
        });

        const data = await res.json();

        if (res.ok) {
            setToast?.({
                open: true,
                message: "Component updated successfully",
                severity: "success",
            });
            setTimeout(() => setToast?.(null), 1000);

            if (update) update(updatedComp);
        } else {
            setToast?.({
                open: true,
                message: `Error updating component: ${data.error || "Unknown error"}`,
                severity: "error",
            });
        }
    } catch (err) {
        setToast?.({
            open: true,
            message: `Network error: ${err}`,
            severity: "error",
        });
    }
}


interface ToastInfo {
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
}


export default function RowConponent({ onDelete, comp, className, expanded, setExpanded, update, q, exact = "" }: Props) {
    const inputRefs = [
        useRef<ValidatedInputRef>(null),
        useRef<ValidatedInputRef>(null),
        useRef<ValidatedInputRef>(null),
        useRef<ValidatedInputRef>(null),
        useRef<ValidatedInputRef>(null),
    ];
    const fensiDivRef = useRef<HTMLDivElement>(null);
    const [toast, setToast] = useState<ToastInfo | null>(null);
    return <div className="w-full"
        onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                setExpanded?.(comp.id);
            }
        }}
    >
        <div ref={fensiDivRef} className={`${className} focus:outline-none focus:bg-bg-hover hover:bg-bg-hover hover:cursor-pointer min-h-[50px] border-t border-primary/30
        transition-color duration-50 grid grid-rows-1 grid-cols-8 w-full px-2 ${exact == comp.mpn ? "text-green-500!" : ""}`} onClick={() => { fensiDivRef.current?.blur(); setExpanded?.(comp.id) }}

            tabIndex={0}>
            <div className="flex items-center col-span-2 col-start-1">
                {comp.mpn}
            </div>
            <div className="flex items-center col-span-3 col-start-3 text-sm">
                {comp.description}
            </div>
            <div className="flex items-center col-start-6">
                {comp.packaging}
            </div>
            <div className="flex flex-row items-center col-start-7">

                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        const newComp = { ...comp, count: Math.max(0, comp.count - 1) };
                        updateComponent(newComp, q, update); // update je funkcija iz Home
                    }}
                >
                    <RemoveIcon fontSize="small" className='text-secondary' />
                </IconButton>

                {comp.count}
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        const newComp = { ...comp, count: comp.count + 1 };
                        updateComponent(newComp, q, update);
                    }}
                >
                    <AddIcon fontSize="small" className='text-secondary' />
                </IconButton>

            </div>
            <div className="flex items-center col-start-8 w-full">
                {comp.place}
                <div className="grow"></div>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                >
                    <DeleteIcon color='warning' className='text-secondary' />
                </IconButton>
            </div>
        </div>
        <div
            className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? "max-h-[842px]" : "max-h-0"
                }`}
            onKeyDown={(e) => {
                if (e.ctrlKey && expanded && e.key === 'S') {
                    e.preventDefault();

                }
            }}
        >
            <div className="flex pt-2 pr-2 pb-2 w-full">
                <div
                    className={`
                        w-3/4
                        overflow-hidden
                        flex flex-col
                        transition-all duration-500 ease-in-out h-[824px]
                        }
                    `}
                >
                    {comp.datasheet && comp.datasheet.length > 0 && comp.datasheet != "" ? (
                        <iframe
                            src={comp.datasheet}
                            tabIndex={-1}
                            className="flex-1 sm:w-full lg:w-full h-full"
                        />
                    ) : (
                        <div className={`flex flex-1 justify-center items-center border-2 border-primary border-dashed rounded-lg w-full h-[824px] overflow-hidden text-foreground/50 `}>
                            No Datasheet Available
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end grow">
                    <ValidatedInput
                        placeholder="MPN"
                        className="opacity-50 mb-4 w-3/4"
                        initialValue={comp.mpn ? comp.mpn : ""}
                        disabled={true}
                        ref={inputRefs[0]}
                        tabIndex={-1}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Description"
                        className="mb-4 w-3/4"
                        initialValue={comp.description ? comp.description : ""}
                        ref={inputRefs[1]}
                        validator={[
                            (val: string) => val.length > 0,
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Packaging"
                        className="mb-4 w-3/4"
                        initialValue={comp.packaging ? comp.packaging : ""}
                        ref={inputRefs[2]}
                        validator={[
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Quantity"
                        className="mb-4 w-3/4"
                        initialValue={comp.count.toString() ? comp.count.toString() : "0"}
                        ref={inputRefs[3]}
                        validator={[
                            (val: string) => val.length > 0,
                            (val: string) => !isNaN(Number(val)),
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Location"
                        className="mb-4 w-3/4"
                        initialValue={comp.place ? comp.place : ""}
                        ref={inputRefs[4]}
                        validator={[
                            (val: string) => val.length > 0,
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Datasheet URL"
                        className="mb-4 w-3/4"
                        initialValue={comp.datasheet ? comp.datasheet : ""}
                        ref={inputRefs[5]}
                        validator={[
                            (val: string) => val.length === 0 || /^https?:\/\/.+\..+/.test(val),
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <Button variant="contained" color="primary" className='mx-4 mb-4 w-3/4' onClick={(e) => {
                        e.stopPropagation();

                        const isValid = inputRefs.every(ref => ref.current ? ref.current.validate() : false);
                        if (!isValid) {
                            console.log("Form is invalid");
                            return;
                        }

                        const updatedComp: ElectronicComponent = {
                            id: comp.id,
                            mpn: inputRefs[0].current?.getValue() || "",
                            description: inputRefs[1].current?.getValue() || "",
                            packaging: inputRefs[2].current?.getValue() || "",
                            count: Number(inputRefs[3].current?.getValue() || "0"),
                            place: inputRefs[4].current?.getValue() || "",
                            datasheet: comp.datasheet,
                        };

                        updateComponent(updatedComp, q, update ? update : () => { }, setToast);
                    }}>
                        Save
                    </Button>
                    <Snackbar
                        open={toast?.open}
                        autoHideDuration={3000}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <Alert severity={toast?.severity} sx={{ width: "100%" }}>
                            {toast?.message}
                        </Alert>
                    </Snackbar>

                </div>
            </div>
        </div>
    </div >
}
function setCount(count: number) {

}