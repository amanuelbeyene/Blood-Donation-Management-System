
import axios from 'axios';

async function main() {
    const id = 'dcc24bfd-9290-492e-a5ee-e1461980af00';
    const url = `http://localhost:5000/api/inventory/${id}`;

    console.log(`Updating inventory ${id} to 0 units...`);

    try {
        const res = await axios.put(url, { unitsAvailable: 0 });
        console.log('Update Success:', res.status, res.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Update Failed:', error.message, error.response?.data);
        } else {
            console.error('Update Failed:', error);
        }
    }
}

main();
