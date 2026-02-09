'use client';

import {useDeviceClass} from '@/shared/utils/device';

export function DeviceDetector() {
    useDeviceClass();
    return null;
}
