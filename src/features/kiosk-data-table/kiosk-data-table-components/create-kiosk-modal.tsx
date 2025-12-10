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

interface CreateKioskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (
        id: string,
        name: string,
        type: string,
        kioskContentIds: string[],
        location: string,
        resortId: number
    ) => Promise<void>
}

export function CreateKioskDialog({
    open,
    onOpenChange,
    onCreate,
}: CreateKioskDialogProps) {
    const { resorts } = useResort() // Fetch resorts using the custom hook

    const [id, setId] = React.useState("")
    const [name, setName] = React.useState("")
    const [type, setType] = React.useState("")
    const [kioskContentIds, setKioskContentIds] = React.useState("1,2,3,4")
    const [location, setLocation] = React.useState('')
    const [resortId, setResortId] = React.useState<number>(0)
    const [_isLoading, _setIsLoading] = React.useState(false)

    // Set the first resort as the default resort when resorts are loaded
    React.useEffect(() => {
        if (resorts.length > 0) {
            if (resorts[0]) {
                setResortId(resorts[0].id)
            }
        }
    }, [resorts])

    const handleCreateKiosk = async () => {
        const contentIds = kioskContentIds.split(",").map((s) => s.trim())
        await onCreate(id, name, type, contentIds, location, resortId)
        setId("")
        setName("")
        setType("")
        setLocation('')
        if (resorts[0]) {
            setResortId(resorts[0].id)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new Kiosk</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Kiosk ID */}
                    <div className="grid gap-2">
                        <Label htmlFor="id">Kiosk ID</Label>
                        <Input
                            id="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder="Enter Kiosk ID"
                        />
                    </div>

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
                            placeholder='Location'
                        />
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateKiosk} disabled={!id || !name || !type || !kioskContentIds || !location || !resortId}>
                        Create Kiosk
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
