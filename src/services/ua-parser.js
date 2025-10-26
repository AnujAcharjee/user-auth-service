import { UAParser } from "ua-parser-js";

export const getDeviceName = (req) => {
    const parser = new UAParser(req.headers["user-agent"]);
    const deviceInfo = parser.getResult();

    const osName = deviceInfo.os.name || "Unknown OS";
    const browserName = deviceInfo.browser.name || "Unknown Browser";
    const deviceModel = deviceInfo.device.model;

    let deviceName;

    if (deviceModel) {
        // Mobile/tablet → actual device model
        deviceName = `${deviceModel} (${osName})`;
    } else {
        // Desktop → friendly label
        if (osName.includes("Windows")) deviceName = "Windows PC";
        else if (osName.includes("Mac")) deviceName = "MacBook";
        else if (osName.includes("Linux")) deviceName = "Linux device";
        else deviceName = osName;

        deviceName += ` (${browserName})`;
    }

    return deviceName;
};
