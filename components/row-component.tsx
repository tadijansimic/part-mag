"use client"

import ElectronicComponent from '@/types/component-type';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, IconButton } from "@mui/material"
import { useRef, useState } from 'react';
import TextField from "@mui/material/TextField";
import ValidatedInput, { ValidatedInputRef } from './input-component';

interface Props {
    className?: string
    comp: ElectronicComponent,
    expanded: boolean,
    setExpanded?: (id: number) => Promise<void> | void,
    update?: () => void | Promise<void>,
}

async function updateComponent(updatedComp: ElectronicComponent, update?: () => void) {
    const res = await fetch("/api/part", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedComp),
    });

    const data = await res.json();
    update?.();
}


export default function RowConponent({ comp, className, expanded, setExpanded, update }: Props) {
    const inputRefs = [useRef<ValidatedInputRef>(null),
    useRef<ValidatedInputRef>(null),
    useRef<ValidatedInputRef>(null),
    useRef<ValidatedInputRef>(null),
    useRef<ValidatedInputRef>(null),
    ];
    return <div className="w-full">
        <div className={`${className} hover:bg-bg-hover hover:cursor-pointer min-h-[50px] 
        transition-color duration-50 grid grid-rows-1 grid-cols-8 w-full px-2`} onClick={() => { setExpanded?.(comp.id) }}>
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
                        updateComponent({ ...comp, count: Math.max(0, comp.count - 1) }, update);
                    }}
                    sx={{
                        width: 25,
                        height: 25,
                        padding: 0,
                    }}
                >
                    <RemoveIcon fontSize="small" className='text-secondary' />
                </IconButton>
                {comp.count}
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        updateComponent({ ...comp, count: comp.count + 1 }, update);
                    }}
                    sx={{
                        width: 25,
                        height: 25,
                        padding: 0,
                    }}
                >
                    <AddIcon fontSize="small" className='text-secondary' />
                </IconButton>
            </div>
            <div className="flex items-center col-start-8">
                {comp.place}
            </div>
        </div>
        <div
            className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? "max-h-[842px]" : "max-h-0"
                }`}
        >
            <div className="flex w-full">
                <iframe
                    src={comp.datasheet}
                    height="842px"
                    className="sm:w-full lg:w-3/4"
                />
                <div className="flex flex-col items-end grow">
                    <ValidatedInput
                        placeholder="MPN"
                        className="mb-4"
                        initialValue={comp.mpn ? comp.mpn : ""}
                        disabled={true}
                        ref={inputRefs[0]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Description"
                        className="mb-4"
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
                        className="mb-4"
                        initialValue={comp.packaging ? comp.packaging : ""}
                        ref={inputRefs[2]}
                        validator={[
                            (val: string) => val.length > 0,
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <ValidatedInput
                        placeholder="Quantity"
                        className="mb-4"
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
                        className="mb-4"
                        initialValue={comp.place ? comp.place : ""}
                        ref={inputRefs[4]}
                        validator={[
                            (val: string) => val.length > 0,
                        ]}
                        onChange={(value, isValid) => {

                        }}
                    />
                    <Button variant="contained" color="primary" className='mx-4 mb-4 w-fit' onClick={(e) => {
                        e.stopPropagation();

                        // triggeruj touched i validaciju za sve
                        const isValid = inputRefs.every(ref => ref.current ? ref.current.validate() : false);
                        if (!isValid) {
                            console.log("Form is invalid");
                            return;
                        }

                        // kreiraj objekat za update
                        const updatedComp: ElectronicComponent = {
                            id: comp.id,
                            mpn: inputRefs[0].current?.getValue() || "",
                            description: inputRefs[1].current?.getValue() || "",
                            packaging: inputRefs[2].current?.getValue() || "",
                            count: Number(inputRefs[3].current?.getValue() || "0"),
                            place: inputRefs[4].current?.getValue() || "",
                            datasheet: comp.datasheet,
                        };

                        // pozovi API
                        updateComponent(updatedComp, update ? update : () => { });
                    }}>
                        Save
                    </Button>

                </div>





            </div>
        </div>
    </div>
}
function setCount(count: number) {

}