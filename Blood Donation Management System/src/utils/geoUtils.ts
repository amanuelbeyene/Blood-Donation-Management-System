
export interface GeoAddress {
    region: string;
    city: string;
    subCity: string;
    woreda: string;
    kebele: string;
    street: string;
    homeNumber: string;
    formattedAddress: string;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    address?: GeoAddress;
}

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
};

export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<GeoAddress> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        const address = data.address || {};

        return {
            region: address.state || address.region || '',
            city: address.city || address.town || address.county || '',
            subCity: address.suburb || address.district || '',
            woreda: address.neighbourhood || '',
            kebele: '', // OSM rarely provides this specific Ethiopian admin level
            street: address.road || '',
            homeNumber: address.house_number || '',
            formattedAddress: data.display_name || ''
        };
    } catch (error) {
        console.error("Geocoding failed", error);
        throw new Error('Failed to retrieve address details');
    }
};
