import React, { createContext, useContext, useState, ReactNode } from 'react';
import { donors as initialDonors, hospitals as initialHospitals } from '../controllers/mockData';
import { Donor } from '../models/Donor';
import { Hospital } from '../models/Hospital';

interface MockDataContextType {
    donors: Donor[];
    hospitals: Hospital[];
    updateDonorStatus: (id: string, status: 'Active' | 'Rejected', reason?: string) => void;
    updateHospitalStatus: (id: string, status: 'Active' | 'Rejected', reason?: string) => void;
    // Add other update methods as needed if you edit donors/hospitals
    setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
    setHospitals: React.Dispatch<React.SetStateAction<Hospital[]>>;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [donors, setDonors] = useState<Donor[]>(initialDonors);
    const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);

    const updateDonorStatus = (id: string, status: 'Active' | 'Rejected', reason?: string) => {
        setDonors(prev => prev.map(d =>
            d.id === id ? { ...d, status, rejectionReason: reason } : d
        ));
    };

    const updateHospitalStatus = (id: string, status: 'Active' | 'Rejected', reason?: string) => {
        setHospitals(prev => prev.map(h =>
            h.id === id ? { ...h, status, rejectionReason: reason } : h
        ));
    };

    return (
        <MockDataContext.Provider value={{ donors, hospitals, updateDonorStatus, updateHospitalStatus, setDonors, setHospitals }}>
            {children}
        </MockDataContext.Provider>
    );
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (context === undefined) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};
