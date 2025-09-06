import { UAParser } from "ua-parser-js";

export const getDeviceName = (req) => {
    const parser = new UAParser(req.headers["user-agent"]);
    const deviceInfo = parser.getResult();
    const deviceName = `${deviceInfo.os.name || "Unknown OS"} • ${deviceInfo.browser.name || "Unknown Browser"}`;

    return deviceName;
}

// works default for Browsers
// in mobile send "user-agent" header with device name and all ..
// same for desktop apps