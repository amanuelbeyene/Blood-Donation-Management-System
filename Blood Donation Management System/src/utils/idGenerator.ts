export const generateDonorId = (): string => {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `DNR-${randomNum}`;
};

export const generateLotteryId = (): string => {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `LOT-${randomNum}`;
};

export const generateHospitalId = (): string => {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `HSP-${randomNum}`;
};
