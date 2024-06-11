// Date validation middleware
const validateDate = (date) => {

    // Check if date is provided
    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    // Check if date is in YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
        return false;
    }

    // Check if date is a valid calendar date
    const [year, month, day] = date.split('-').map(Number);
    const dateObject = new Date(year, month - 1, day);

    // Date object should match the input date
    if (dateObject.getFullYear() !== year || dateObject.getMonth() !== month - 1 || dateObject.getDate() !== day) {
        return false;
    }

    // If all checks pass, proceed to the next middleware
    return true
}


module.exports = { validateDate }