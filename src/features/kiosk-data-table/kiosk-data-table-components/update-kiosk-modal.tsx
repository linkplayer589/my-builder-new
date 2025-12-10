"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useResort } from "@/features/resorts"
import { type Kiosk } from "@/db/schema"

interface UpdateKioskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kiosk: Kiosk | null
    onUpdate: (
        id: string,
        name: string,
        type: string,
        kioskContentIds: string[],
        location: string,
        resortId: number
    ) => Promise<void>
}

export function UpdateKioskDialog({
    open,
    onOpenChange,
    kiosk,
    onUpdate,
}: UpdateKioskDialogProps) {
    const { resorts } = useResort()

    const [id, setId] = React.useState(kiosk?.id || "")
    const [name, setName] = React.useState(kiosk?.name || "")
    const [type, setType] = React.useState(kiosk?.type || "")
    const [kioskContentIds, setKioskContentIds] = React.useState(
        (kiosk?.kioskContentIds || []).join(",")
    )
    const [location, setLocation] = React.useState(() => {
        if (!kiosk?.location) return '';
        if (typeof kiosk.location === 'string') return kiosk.location;
        if (typeof kiosk.location === 'object' && kiosk.location !== null && 'label' in kiosk.location) {
            const labelValue = (kiosk.location as { label: unknown }).label;
            return typeof labelValue === 'string' ? labelValue : '';
        }
        return '';
    })
    const [resortId, setResortId] = React.useState(kiosk?.resortId || 0)

    React.useEffect(() => {
        if (kiosk) {
            setId(kiosk.id)
            setName(kiosk.name)
            setType(kiosk.type)
            setKioskContentIds(kiosk.kioskContentIds.join(","))
            setLocation(() => {
                if (typeof kiosk.location === 'string') return kiosk.location;
                if (typeof kiosk.location === 'object' && kiosk.location !== null && 'label' in kiosk.location) {
                    const labelValue = (kiosk.location as { label: unknown }).label;
                    return typeof labelValue === 'string' ? labelValue : '';
                }
                return '';
            })
            setResortId(kiosk.resortId)
        }
    }, [kiosk])

    const handleUpdateKiosk = async () => {
        const contentIds = kioskContentIds.split(",").map((s) => s.trim())
        await onUpdate(id, name, type, contentIds, location, resortId)
        onOpenChange(false) // Close the modal after updating
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Kiosk</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Kiosk ID */}
                    {/* <div className="grid gap-2">
                        <Label htmlFor="id">Kiosk ID</Label>
                        <Input
                            id="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder="Enter Kiosk ID"
                            readOnly
                        />
                    </div> */}

                    {/* Kiosk Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Kiosk Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Kiosk Name"
                        />
                    </div>

                    {/* Kiosk Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type">Kiosk Type</Label>
                        <Input
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            placeholder="Enter Kiosk Type"
                        />
                    </div>

                    {/* Kiosk Content IDs */}
                    <div className="grid gap-2">
                        <Label htmlFor="kioskContentIds">Content IDs</Label>
                        <Input
                            readOnly
                            id="kioskContentIds"
                            value={kioskContentIds}
                            onChange={(e) => setKioskContentIds(e.target.value)}
                            placeholder="e.g. 1, 2, 3"
                        />
                    </div>

                    {/* Resort ID Dropdown */}
                    <div className="grid gap-2">
                        <Label htmlFor="resortId">Resort</Label>
                        <Select value={resortId.toString()} onValueChange={(value) => setResortId(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a resort" />
                            </SelectTrigger>
                            <SelectContent>
                                {resorts.map((resort) => (
                                    <SelectItem key={resort.id} value={resort.id.toString()}>
                                        {resort.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location (JSON) */}
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location"
                        />
                    </div>
                </div>
                <DialogFooter
                    className="flex flex-col gap-2 sm:flex-row sm:gap-4"
                >
                    <Button onClick={handleUpdateKiosk} disabled={!id || !name || !type || !kioskContentIds || !location || !resortId}>
                        Update Kiosk
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
