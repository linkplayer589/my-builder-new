import { useQuery } from "@tanstack/react-query"
import { dbGetAllDevices } from "../db-get-all-devices"
import { type Device } from "@/db/schema"
const DEVICES_QUERY_KEY = ["devices"] as const

async function getDevices(): Promise<Device[]> {
    const devices = await dbGetAllDevices()
    if (!devices) {
        throw new Error("Failed to fetch devices")
    }
    return devices
}

export function useDevices() {
    const { data, ...rest } = useQuery({
        queryKey: DEVICES_QUERY_KEY,
        queryFn: getDevices,
        staleTime: Infinity, // Never mark the data as stale since device data changes infrequently
        gcTime: Infinity, // Never garbage collect the data
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: 1000,
    })

    const deviceMap = new Map<string, Device>()
    const dtaMap = new Map<string, Device>()
    const serialMap = new Map<string, Device>()

    if (data) {
        data.forEach(device => {
            deviceMap.set(device.chipId, device)
            serialMap.set(device.serial, device)
        })
    }

    return {
        data,
        deviceMap,
        dtaMap,
        serialMap,
        ...rest,
    }
} 