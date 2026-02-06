
export const sendSMS = async (to: string, message: string): Promise<void> => {
    // Mock SMS Service
    console.log('================================================');
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    console.log('================================================');
    return Promise.resolve();
};
